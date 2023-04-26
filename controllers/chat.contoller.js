import asyncHandler from "express-async-handler";
import User from '../models/user.schema.js';
import Chat from "../models/Chat.schema.js";
import mongoose from "mongoose";



/******************************************************
 * @CREATE_OR_FETCH_ONE_TO_ONE_CHAT
 * @route http://localhost:5000/api/chat/
 * @description User can create new chat or get an existing chat
 * @parameters UserId of other user
 * @returns Chat object
 ******************************************************/

export const accessChat=asyncHandler(async(req,res)=>{
    const {userId}=req.body

    // check if userId is present or not
    if(!userId){
        res.status(400)
        throw new Error("userId is required");
    }

    let isChat=await Chat.find({
        isGroupChat: false,
        $and: [
            {users: {$elemMatch: {$eq: req.user._id}}},
            {users: {$elemMatch: {$eq: userId}}},
        ]
    })
    .populate("users","-password")
    .populate("latestMessage");


    isChat=await User.populate(isChat,{
        path: "latestMessage.sender",
        select: "name profilePicture email",
    });

    if(isChat.length>0){
        res.status(200).send(isChat[0]);
    }else{
        const chatData={
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };

        try {
            const createChat=await Chat.create(chatData);
            const fullChat=await Chat.findOne({_id: createChat._id}).populate("users","-password");
            res.status(200).json(fullChat);
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
})

/******************************************************
 * @FETCH_ALL_CHATS
 * @route http://localhost:5000/api/chats/
 * @description fetch all chats of user
 * @parameters UserId
 * @returns Chat Object
 ******************************************************/

export const fetchChats=asyncHandler(async(req,res)=>{
    try {
       Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
       .populate("users","-password")
       .populate("groupAdmin","-password")
       .populate("latestMessage")
       .sort({updatedAt: -1})
       .then(async(results)=>{
        results=await User.populate(results,{
            path: "latestMessage.sender",
            select: "name profilePicture email"
        });
        res.status(200).send(results);
       }) 
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})


/******************************************************
 * @CREATE_NEW_GROUP_CHAT
 * @route http://localhost:5000/api/chats/createGroup
 * @description create a new group
 * @parameters group name, group users array
 * @returns Chat Object
 ******************************************************/

export const createGroup=asyncHandler(async(req,res)=>{
    if(!(req.body.users && req.body.name)){
        return res.status(400).send("All feilds are required")
    }


    let users=JSON.parse(req.body.users);
    // check if minimum three user are present 
    if(users.length<1){
        return res.status(400).send("Minimum three users are required to form a group")
    }

    users.push(req.user)

    try {
        const groupChat=await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat=await Chat.findOne({_id: groupChat._id})
        .populate("users","-password")
        .populate("groupAdmin","-password")

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})


/******************************************************
 * @RENAME_GROUP
 * @route http://localhost:5000/api/chats/renameGroup
 * @description rename a group
 * @parameters chatId, name
 * @returns Chat Object
 ******************************************************/

export const renameGroup=asyncHandler(async(req,res)=>{
    const {chatId, chatName}=req.body


    if(!(chatId && chatName)){
        res.status(400)
        throw new Error("All fields are required");
    }

    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,
        {chatName: chatName},
        {
            new: true
        }
        )
        .populate("users","-password")
        .populate("groupAdmin","-password")

        if(!updatedChat){
            res.status(400)
            throw new Error("Chat not Found!");
        }
        else{
            res.status(200).json(updatedChat)
        }
})

/******************************************************
 * @REMOVE_USER_FROM_GROUP
 * @route http://localhost:5000/api/chats/removeFromGroup
 * @description remove a user from group
 * @parameters ChatId, userId
 * @returns Chat Object
 ******************************************************/

export const removeFromGroup=asyncHandler(async(req,res)=>{
    const {chatId, userId}=req.body

    if(!(chatId && userId)){
        res.status(400)
        throw new Error("All fields are required");
    }

    // check if requesting user is admin or not

    const chat=await Chat.findOne({
        _id: chatId,
        groupAdmin: req.user._id
    })

    if(!(chat)){
        res.status(400)
        throw new Error("Only group admin can remove a user");
    }

    const removed=await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: userId}
        },
        {
            new: true
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password")


    if(!removed){
        res.status(400)
        throw new Error("chat not found")
    }
    else{
        res.status(200).json(removed)
    }
})


/******************************************************
 * @ADD_TO_GROUP
 * @route http://localhost:5000/api/chats/addtoGroup
 * @description add a user in group
 * @parameters ChatId, userId
 * @returns Chat Object
 ******************************************************/

export const addToGroup=asyncHandler(async(req,res)=>{
    const {chatId, userId}=req.body

    if(!(chatId && userId)){
        res.status(400)
        throw new Error("All fields are required");
    }

    // check if requesting user is admin or not

    const chat=await Chat.findOne({
        _id: chatId,
        groupAdmin: req.user._id
    })

    if(!(chat)){
        res.status(400)
        throw new Error("Only group admin can add a user");
    }

    const updatedGroup=await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: userId}
        },
        {
            new: true
        }
    ).populate("users","-password")
    .populate("groupAdmin","-password")

    if(!updatedGroup){
        res.status(400)
        throw new Error("chat not found");
    }
    else{
        res.status(200).json(updatedGroup)
    }

})