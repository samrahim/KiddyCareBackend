const express=require("express")
const r=express.Router()
const db=require("../models")
const { Op, where ,Sequelize} = require('sequelize');
const bcrypt=require("bcrypt")
const multer=require("multer")
const upload = multer({ dest: 'uploads/' })
const cloundinaryUpload=require("../cloudinary.uploads");
const { noDoubleNestedGroup } = require("sequelize/lib/utils/deprecations");
const sitter = require("../models/sitter");



r.post('/register', async (req, res) => {
  const { familleName, famillePhone, famillePassword, familleFcmToken, familleEmail } = req.body;
     try {
        const famille = await db.Famille.create({
          
          familleName:familleName,
          famillePhone: famillePhone || null,
          famillePassword:await bcrypt.hash(famillePassword,10),
          familleFcmToken,
          familleEmail: familleEmail || null,
          familleAdress:"",
          familleImagePath:""
        }).then((re)=>{res.json({
       
          "success":"true",
          "res":re
        })}).catch((e)=>{res.send("error"+e)});
    
        return res.status(201).json( famille);
      } catch (error) {
        return res.status(400).json( 'Failed to register Famille '+error );
      }
  }
);
r.get("/info/:familleId",async(req,res)=>{
  const famille= await db.Famille.findOne({where:{familleId:req.params.familleId}})
  return res.send(famille)
})

  r.post("/login",async(req,res,next)=>{

    const famille=async()=>{
      if (req.body.famillePhone) {
       
        return await db.Famille.findOne({ where: { famillePhone: req.body.famillePhone } });
      }else{
      
        return await db.Famille.findOne({ where: { familleEmail: req.body.familleEmail } });
      }
    }
    
    famille().then(async(foundFamille) => {
      if (!foundFamille) {
        return res.send("no user found");
      }else{
        const famillePassword=req.body.famillePassword
        const compareResult=await  bcrypt.compare(famillePassword,foundFamille.famillePassword)
        if (!compareResult) {
          return res.send("Incorrect Info !")
        }
        return res.send(foundFamille)
      }
     
    }).catch((error) => {
      console.error(error);
      return res.status(400).send(error);
    });
 
  })

  r.post("/addtofavorite/:id/:sitterid",async(req,res)=>{
    db.FavoriteSitter.Create({
      
    })
  })

r.put("/updateinfo/:familleId",upload.single("file"),async(req,res)=>{

  if (!req.file) {
    await db.Famille.update({
      familleAdress:req.body.familleAdress,
      familleLatitude:parseFloat(req.body.familleLatitude),
      familleLongitude:parseFloat(req.body.familleLongitude),
      familleImagePath:"default",
    },
    {where:{familleId:req.params.familleId}}
    ).then((re)=>{return res.send("updated")}).catch((e)=>{
      console.log(e)
      return res.send(e)})
  }else{
    await cloundinaryUpload.uploadFile(req.file.path).then(async(re)=>{
      await db.Famille.update({
        familleAdress:req.body.familleAdress,
        familleImagePath:re.secure_url,
        familleLatitude:parseFloat(req.body.familleLatitude),
        familleLongitude:parseFloat(req.body.familleLongitude),
      },
      {where:{familleId:req.params.familleId}}
      )
      return res.status(200).send(re)
      })
    .catch((e)=>{
      console.log(e)
      return res.status(400).json(e)})
  }

  })
  r.get("/findsittersnearby/:lat/:lon", async (req, res, next) => {
    const userLatitude = parseFloat(req.params.lat);
    const userLongitude = parseFloat(req.params.lon);
  

    try {
      const nearbySitters=[];
        const sitters = await db.Sitter.findAll();
        for (const sitter of sitters) {
        const val=  getDistanceFromLatLonInKm(userLatitude,userLongitude,sitter.sitterLatitude,sitter.sitterLongitude)
      
        if (val<30) {
          nearbySitters.push(sitter)
        }
        }
// console.log(nearbySitters)
for (const sitter of nearbySitters) {
  const averageRating = await sitter.calculateAverageRating();
  sitter.dataValues.averageRating = averageRating;
}
        res.json(nearbySitters);
    } catch (errors) {
        console.error(errors);
        res.status(500).json({  'An error occurred while fetching sitters.':errors });
    }
});
  r.get("/getnewsitters",async(req,res,next)=>{
    const currentMonth = new Date();
        currentMonth.setDate(1); 
        currentMonth.setHours(0, 0, 0, 0);
    const sitters=await db.Sitter.findAll({
      where:{
        createdAt: {
          [Op.gte]: currentMonth 
      }
      }
    })
    for (const sitter of sitters) {
      const averageRating = await sitter.calculateAverageRating();
      sitter.dataValues.averageRating = averageRating;
  }
  res.json(sitters);
  })

  r.get("/getsitter/:sitterId",(req,res,next)=>{
   
    db.Sitter.findOne({where:{sitterId:req.params.sitterId}}).then(async(result)=>{
    const averageRating = await result.calculateAverageRating();
    result.dataValues.averageRating = averageRating;
    res.status(200).send(result)}).catch((e)=>{res.status(400).send(e)})
  })

  r.get('/toprated',async(req,res)=>{
    const sitters = await db.Sitter.findAll({
      include: [{
          model: db.Rating,
          attributes: [],
          required: true, 
      }],
     
      group: ['Sitter.sitterId'], 
      having: Sequelize.literal('AVG(Ratings.rating) > 3'),
  });
  for (const sitter of sitters) {
    const averageRating = await sitter.calculateAverageRating();
  sitter.dataValues.averageRating = averageRating;
  }
  return res.send(sitters);
  })
  
  r.post("/addfavorites/:parentId/:sitterId",async(req,res)=>{
    const sitterId  = req.params.sitterId;
    const familleId = req.params.parentId;

    try {
       
        const famille = await db.Famille.findOne({where:{familleId:familleId}});
        const sitter = await db.Sitter.findOne({where:{sitterId:sitterId}});

       const fav=await db.Favorite.findOne({
        where:{familleId:familleId,sitterId:sitterId}
       })
       if (!fav) {
        const favorite = await db.Favorite.create({
          familleId: familleId,
          sitterId: sitterId
      });
      return res.status(201).json(favorite);
       }
        

      
    } catch (error) {
        console.error("Error adding sitter to favorites:", error);
        return res.status(500).json({ error: "Failed to add sitter to favorites" });
    }
  })

  r.get("/myfavorites/:parentId",async(req,res)=>{
    const famille = await db.Famille.findOne({where:{familleId:req.params.parentId}});
    if (!famille) {
        return res.status(404).json({ error: "Family not found" });
    }

    const sitters = await db.Favorite.findAll({
        where: {
            familleId: famille.familleId
        },
        include: [{
            model: db.Sitter 
        }]
    });

   
    const sittersOfParent = sitters.map(favorite => favorite.Sitter);
    for (const sitter of sittersOfParent) {
    const averageRating = await sitter.calculateAverageRating();
    sitter.dataValues.averageRating = averageRating;
    }
    return res.status(200).json(sittersOfParent);
  })

  r.get("/getrating/:parentId/:sitterId",async(req,res)=>{
    const ratingmodel = await db.Rating.findOne({where:{sitterId:req.params.sitterId,parentId:req.params.parentId}})
    if (!ratingmodel) {
    return res.send({"rating":1})
    }else{
      return res.send({"rating":ratingmodel.rating})
    }
  })

  r.delete("/delete/:familleId/:sitterid",async(req,res)=>{
    const familleId = req.params.familleId;
    const sitterId = req.params.sitterid;
    const favorite = await db.Favorite.findOne({
      where: {
        familleId: familleId,
          sitterId: sitterId,
      }
  });
  await favorite.destroy();
  return res.send("deleted")
  })

  r.post("/rate/:familleId/:sitterId",async(req,res)=>{
    
    await db.Rating.create({
      famille_id:req.params.familleId,
      sitter_id:req.params.sitterId,
      rating:req.body.rating,
      ratingComment:req.body.ratingComment
    }).then((response)=>{res.send({"rated":true})}).catch((e)=>{res.send({"rated":false})})
  })

  r.get("/sitterrating/:sitterId",async(req,res)=>{
    await db.Rating.findAll({
      where:{sitter_id:req.params.sitterId},
      include: {
        model: db.Famille,
        attributes: ['familleName', 'familleImagePath']
    }
    }).then((re)=>{res.send(re)}).catch((e)=>{res.send(e)})
  })


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; 
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI/180)
}
module.exports=r
/*

r.get("/getparent/:id",(req,res,next)=>{
  const id=req.params.id
  db.Parent.findOne({where:{id:id}}).then((result)=>{res.status(200).send(result)}).catch((e)=>{res.status(400).send(e)})
})

r.get("/getparents",(req,res,next)=>{
  db.Parent.findAll().then((result)=>{res.status(200).send(result)}).catch((e)=>{res.status(400).send(e)})
})

r.delete("/deleteparent/:id",(req,res,next)=>{
  const id=req.params.id
  db.Parent.destroy({where:{id:id}}).then((result)=>{res.status(200).send("parent deleted")}).catch((e)=>{res.status(400).send(e)})
})
*/
