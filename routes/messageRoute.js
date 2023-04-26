import express from "express";
import { isLoggedIn } from "../middleware/authMiddleware.js";


const messageRouter=express.Router();


import {getAllMessages, sendMessage} from "../controllers/message.contoller.js"


messageRouter.route("/getAllMessages/:chatId").get(isLoggedIn, getAllMessages);
messageRouter.route("/sendMessage").post(isLoggedIn, sendMessage);


export default messageRouter;
