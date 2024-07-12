import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";

const protect = asyncHandler(async(req, res, next)=>{
    console.log(req.body)
    let token = req.cookies.jwt;

    console.log("req.cookies.jwt: ",req.cookies.jwt)
    if(token){
        try {
            const decoded = jwt.verify(token, "smrithi_7389");
            console.log("decoded", decoded)

            req.user = await User.findById(decoded.userId).select('-password');
            console.log(req.user)
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, invalid token')
        }
    } else {
        res.status(401);
        throw new Error('Not Authorized, no token');
    }
});

export {protect};