import express from "express";
import { isLoggedIn } from "../middleware/authMiddleware.js";
const authRouter=express.Router();

import { imageUpload, register, search, signIn} from "../controllers/auth.controller.js";

authRouter.route('/register').post(register);

authRouter.route('/login').post(signIn);

authRouter.route('/search/:key').get(isLoggedIn, search);

authRouter.route('/imageUpload').post(imageUpload);

export default authRouter