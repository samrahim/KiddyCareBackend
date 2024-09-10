const express=require("express")
const r=express()
const db=require("../models")
const { Op, where ,Sequelize, INTEGER} = require('sequelize');

r.post("/create/:parentId",async(req,res)=>{
    console.log(req.body.date);
const originalDate = new Date(req.body.date);
const newDate = new Date(originalDate);
newDate.setDate(originalDate.getDate() + 1);
newDate.setHours(0, 0, 0, 0);
await db.Job.create({
    descreption:req.body.descreption,
    parent_Id:parseInt(req.params.parentId),
    children:parseInt(req.body.children),
    date:newDate,
    startTime:req.body.startTime,
    endTime:req.body.endTime,
    minPriceForHoure:req.body.minPriceForHoure,
    maxPriceForHoure:req.body.maxPriceForHoure,
}).then((response)=>{res.send("created")}).catch((e)=>{res.send("err")})
})
r.post("/assignesitter/:sitterId/:jobId",async(req,res)=>{
   const job= db.Job.findOneAndUpdate({
        where:{id:req.params.jobId}
    })
   const up= job.update({
        sitter_Id:req.params.sitterId
    })
})

r.get("/getjobs/:parentId",async(req,res)=>{
    await db.Job.findAll({
        where:{
            parent_Id:req.params.parentId
        },
        include: [{
            model: db.Famille,
            attributes: ['familleName','familleImagePath'] 
        }],
    }).then((response)=>{
        res.send(response)
    }).catch((e)=>{
        res.send("err"+e)
    })
});

r.get("/getemptyjobs",async(req,res)=>{
  const emptyJobs=  await db.Job.findAll({
        where:{sitter_Id:null},
        include: [{
            model: db.Famille,
            attributes: ['familleName','familleImagePath'] 
        }]
    })
    res.send(emptyJobs)
})
r.post("/assigneJobToSitter/:jobId/:sitterId",async(req,res)=>{
await db.Job.update(
  { sitterId:res.params.sitterId },
  { where: { jobId: req.params.jobId } }
)
})

module.exports=r






