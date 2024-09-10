const express = require("express")
const r = express.Router()
const db = require("../models")
const { Op, where } = require('sequelize');
const multer = require("multer")
const upload = multer({ dest: 'uploads/' })
const cloundinaryUpload = require("../cloudinary.uploads");
const bcrypt = require("bcrypt");
const famille = require("../models/famille");
const admin = require("./admin")
r.post('/register', async (req, res) => {
  const { sitterName, sitterPhone, sitterPassword, sitterFcmToken, sitterEmail, sitterAdress } = req.body;


  try {
    const sitter = await db.Sitter.create({
      sitterName: sitterName,
      sitterPhone: sitterPhone || null,
      sitterPassword: await bcrypt.hash(sitterPassword, 10),
      sitterFcmToken,
      sitterEmail: sitterEmail || null,
      sitterAdress: sitterAdress || "",
      sitterImagePath: ""
    }).then((re) => {
      res.json({
        "success": "true",
        "res": re
      })
    }).catch((e) => { res.send("error" + e) });

    return res.status(201).json(sitter);
  } catch (error) {
    return res.status(400).json('Failed to register Sitter ' + error);
  }
}
);
r.post("/login", async (req, res, next) => {


  const sitter = async () => {
    if (req.body.sitterPhone) {
      return await db.Sitter.findOne({ where: { sitterPhone: req.body.sitterPhone } });
    } else {
      return await db.Sitter.findOne({ where: { sitterEmail: req.body.sitterEmail } });
    }
  }

  sitter().then(async (foundSitter) => {

    if (!foundSitter) {
      return res.send("no user found");
    } else {
      const sitterPassword = req.body.sitterPassword
      const compareResult = await bcrypt.compare(sitterPassword, foundSitter.sitterPassword)
      if (!compareResult) {
        return res.send("Incorrect Info !")
      }
      return res.send(foundSitter)
    }

  }).catch((error) => {
    console.error(error);
    return res.status(400).send(error);
  });

})
r.get("/info/:sitterId", async (req, res) => {
  const sitter = await db.Sitter.findOne({ where: { sitterId: req.params.sitterId } })
  return res.send(sitter)
})


r.put("/updateinfo/:sitterId", upload.single("file"), async (req, res) => {
  console.log("we have new request +++++++======")
  if (!req.file) {
    await db.Sitter.update({
      sitterAdress: req.body.sitterAdress,
      sitterImagePath: "default",
      sitterLatitude: req.body.sitterLatitude,
      sitterLongitude: req.body.sitterLongitude,
    },
      { where: { sitterId: req.params.sitterId } }
    ).then((re) => { return res.send("updated") }).catch((e) => { return res.send(e) })
  } else {
    await cloundinaryUpload.uploadFile(req.file.path).then(async (re) => {
      await db.Sitter.update({
        sitterAdress: req.body.sitterAdress,
        sitterImagePath: re.secure_url,
        sitterLatitude: req.body.sitterLatitude,
        sitterLongitude: req.body.sitterLongitude,
        sitterExperiance: req.body.sitterExperiance
      },
        { where: { sitterId: req.params.sitterId } }
      )
      return res.status(200).send(re)
    })
      .catch((e) => { return res.status(400).json(e) })
  }
})


r.post("/updatebioandexperiance/:sitterid", async (req, res) => {
  await db.Sitter.update({
    sitterBio: req.body.sitterBio,
    sitterExperiance: req.body.sitterExperiance,

  }, {
    where: { sitterId: req.params.sitterid }
  }).then((re) => { res.status(200).send("updated") }).catch((e) => { res.status(400).json({ "err": e }) })
})

r.post('/applyforjob/:famille/:sitterName', async (req, res) => {

  const famille = await db.Famille.findOne({ where: { familleId: req.params.famille } })
  const token = famille.familleFcmToken

  const body = req.params.sitterName + " is ready to take care for your child"
  const title = "new sitter apply for your job post"

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };
  try {
    const response = await admin.messaging().send(message);
    res.status(200).send(`Successfully sent message: ${response}`);
  } catch (error) {
    res.status(500).send(`Error sending message: ${error}`);
  }
})

module.exports = r