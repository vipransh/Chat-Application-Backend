import mongoose from "mongoose";
import AuthRole from "../utils/AuthRole.js";
import bcrypt from "bcrypt"
import config from "../config/envconfig.js";
// const jwt = require('jsonwebtoken');
import jwt from "jsonwebtoken"

const userSchema=mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxLength: [50, "Name must be less than 50 char"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: [8, "Password must be atleast 8 char"],
            select: false
        },
        profilePicture: {
            type: String,
            required: [true, "Profile picture is required"]
        },
        role: {
            type: String,
            enum: Object.values(AuthRole),
            default: AuthRole.USER
        }
    },
    {
        timestamps: true
    }
);


// Encrypt password before saving into database

userSchema.pre("save",async function (next){
    if(!this.isModified("password"))
    {
        return next();
    }

    this.password=await bcrypt.hash(this.password, 10);
})


userSchema.methods={
    // compare password
    comparePassword: async function (password) {
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
      },

    // generate jwt token

    getJwtToken: function (){
        return jwt.sign({
            _id: this._id,
            role: this.role
        },
        config.JWT_SECRET,
        {expiresIn: config.JWT_EXPIRY})
    }
}


export default mongoose.model("User", userSchema);