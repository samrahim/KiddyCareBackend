const express=require("express")
const r=express.Router()
const db=require("../models")
const { where } = require("sequelize")
const famille = require("../models/famille")

r.get("/famille/chats/:familleId",async(req,res)=>{
    const chats = await db.Chatroom.findAll({
        where: { famille_id: req.params.familleId },
        include: [
            { model: db.Sitter ,
            attributes: ['sitterId', 'sitterName', 'sitterImagePath', 'createdAt', 'updatedAt']
        },]
    });
    return res.send(chats)
})

r.get("/sitter/chats/:sitterId",async(req,res)=>{
    const chats = await db.Chatroom.findAll({
        where: { sitter_id: req.params.sitterId },
        include: [
            { model: db.Famille ,
            attributes: ['familleId', 'familleName', 'familleImagePath', 'createdAt', 'updatedAt']
        },]
    });
    return res.send(chats)
})

r.get("/chatmessages/:chatId",async(req,res)=>{
const messages=await db.Message.findAll({where:{chatroom_id:req.params.chatId}})
return res.send(messages)
})

r.post("/newmessage/:chatId",async(req,res)=>{
    const  {message_body,sender}=req.body
     db.Message.create({
        message_body,
        sender,
        chatroom_id:req.params.chatId
    }).then((r)=> {return res.send("message created")}).catch((e)=>{return res.send(e)})
})
 
module.exports=r