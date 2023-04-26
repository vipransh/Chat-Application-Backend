import User from '../models/user.schema.js'
import JWT from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import config from '../config/envconfig.js'


export const isLoggedIn=asyncHandler(async(req,res,next)=>{
    let token;

    if(
        req.cookies.token || 
        (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    ){
        token=req.cookies.token || req.headers.authorization.split(" ")[1]
    }

    if(!token){
        res.status(400)
        throw new Error("Not authorized to access this route")
    }

    try {
        const decodeJwtPayload=JWT.verify(token, config.JWT_SECRET)

        req.user=await User.findById(decodeJwtPayload._id)
        next()
    } catch (error) {
        res.status(400)
        throw new Error("Not authorized to access this route")
    }
})