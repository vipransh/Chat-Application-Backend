import express from "express";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const chatRouter=express.Router();

import { accessChat, addToGroup, createGroup, fetchChats, removeFromGroup, renameGroup } from "../controllers/chat.contoller.js";


chatRouter.route("/accessChat").post(isLoggedIn, accessChat);
chatRouter.route("/fetchChats").get(isLoggedIn,fetchChats);
chatRouter.route("/createGroup").post(isLoggedIn,createGroup);
chatRouter.route("/renameGroup").put(isLoggedIn, renameGroup);
chatRouter.route("/removeFromGroup").put(isLoggedIn,removeFromGroup);
chatRouter.route("/addToGroup").put(isLoggedIn, addToGroup);


export default chatRouter;