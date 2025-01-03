import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { use } from "react";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {username,code} = await request.json()
        const decodedUsername = decodeURIComponent(username) // this will decoded the values comming from the url means getting actual value
        
        const user = await UserModel.findOne({username:decodedUsername})
        if(!user){
            return Response.json(
                {
                    success:false,
                    message:"user not found"
                },
                {status:500}
            )
        }

        const isCodeValid = user.verifyCode == code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date() 
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success:true,
                    message:"Account verified successfully"
                },
                {status:200}
            )
        }
        else if(!isCodeNotExpired){
            return Response.json(
                {
                    success:false,
                    message:"verification code has expired, please sign up again to get a new code"
                },
                {status:400}
            )
        }
        else{
            return Response.json(
                {
                    success:false,
                    message:"incorrect verification code"
                },
                {status:200}
            )
        }

    } catch (error) {
        console.error("error verifying code",error)
        return Response.json(
            {
                success:false,
                message:"error verifying code"
            },
            {status:500}
        )
    }
}