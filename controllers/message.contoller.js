import asyncHandler from "express-async-handler";
import Message from '../models/Message.schema.js'
import User from '../models/user.schema.js'
import Chat from '../models/Chat.schema.js'


/******************************************************
 * @GET_ALL_MESSAGES
 * @route http://localhost:5000/api/messages/getAllMessages
 * @description User can get all of his messages
 * @parameters UserId
 * @returns Message Object
 ******************************************************/

export const getAllMessages=asyncHandler(async(req,res)=>{
    try {
        const {chatId}=req.params

        if(!chatId){
            res.status(400)
            throw new Error("ChatId is required")
        }
        const messages=await Message.find({chat: chatId})
        .populate("sender","name email profilePicture")
        .populate("chat")

        res.status(200).json(messages);
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})


/******************************************************
 * @CREATE_NEW_MESSAGE
 * @route http://localhost:5000/api/message/sendMessage
 * @description User can create and send new messages
 * @parameters chatId, content
 * @returns Message Object
 ******************************************************/

export const sendMessage=asyncHandler(async(req,res)=>{
    const {chatId, content}=req.body

    // check if chatId and content is present
    if(!(chatId && content)){
        res.status(400)
        throw new Error("chatId and content is required")
    }

    const newMessage={
        sender: req.user._id,
        content: content,
        chat: chatId,
    }

    try {
        let message=await Message.create(newMessage)

        message=await message.populate("sender","name profilePicture")
        message=await message.populate("chat")
        message=await User.populate(message,{
            path: "chat.users",
            select: "name profilePicture email"
        });

        await Chat.findByIdAndUpdate(chatId,{latestMessage: message});

        res.status(200).json(message);
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})