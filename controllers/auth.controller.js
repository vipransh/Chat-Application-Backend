import asyncHandler from "express-async-handler";
import User from "../models/user.schema.js"
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cloudinary = require("cloudinary").v2;
import config from '../config/envconfig.js';





export const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
}

// Configuration 
cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
  });

  


/******************************************************
 * @REGISTER
 * @route http://localhost:5000/api/auth/register
 * @description User regestration Controller for creating new user
 * @parameters name, email, password, profilePicture url string
 * @returns User Object
 ******************************************************/

export const register=asyncHandler(async(req, res)=>{

        const {name, email, password}=req.body
     
        const file=req.files.image

              // check if all feilds exists
        if(!(name && email && password && file))
        {
            res.status(400);
            throw new Error("All feilds are required");
        }

        // check if file is image or not
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.mimetype)) {
           return res.status(400).send('Only image files are allowed');
         }

        // check if user already exists
        const existingUser=await User.find({email});

        if(existingUser.name){
            res.status(400)
            throw new Error("User already exists");
        }
        // upload profile picture to cloudinary
        let imageUrl;
        await cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
            if(err){
                console.log(err);
                res.status(400).send(err)
            }
            else{
                // res.status(200).send(result)
                 imageUrl=result.secure_url;
                 // create new user entry in database
            }
         })

         const user=await User.create({
            name,
            email,
            profilePicture: imageUrl,
            password
        });

        if(user)
        {
            const token=user.getJwtToken()
            user.password=undefined

            // send cookies to frontend

            res.cookie("token", token,cookieOptions);

            res.status(200).json({
                success: true,
                user,
                token
            })
        }
        else
        {
            res.status(400).json({
                success: false,
                message: "failed to create user"
            })
        }

})

/******************************************************
 * @SIGNIN
 * @route http://localhost:5000/api/auth/signIn
 * @description User signIn Controller for loging new user
 * @parameters  email, password
 * @returns User Object
 ******************************************************/

export const signIn=asyncHandler(async(req,res)=>{
    // get email and password from req.body
    const {email, password}=req.body

    // check if email and password exists
    if(!(email && password))
    {
        res.status(400);

        throw new Error("Email and password are required");
    }

    const user=await User.findOne({email}).select('+password')

    if(!user){
        res.status(401)
        throw new Error("Email or password is invalid");
    }

    const isPasswordMatched=await user.comparePassword(password);

    if(isPasswordMatched)
    {
        const token=user.getJwtToken();
        user.password=undefined
        res.cookie("token",token,cookieOptions)
        res.status(201).json({
            success: true,
            token,
            user
        })
    }
})

/******************************************************
 * @SEARCH_USERS
 * @route http://localhost:5000/api/auth/search
 * @description User can search username or email from User collection
 * @parameters search string
 * @returns User Object
 ******************************************************/

export const search=asyncHandler(async(req,res)=>{
    // get search string from req.params
    const {key: search}=req.params


    // check if keyword is not empty
    if(!search){
        res.status(400)
        throw new Error("search keyword is required")
    }

    const keyword={
        $or:[
            {name: {$regex: search, $options: "i"}},
            {email: {$regex: search, $options: "i"}},
        ],
    }

    const user= await User.find(keyword).find({_id: {$ne: req.user._id}});

    res.status(201).json({
        success: true,
        user
    })


})