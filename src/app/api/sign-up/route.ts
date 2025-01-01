import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()
    try {
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified:true})

        if(existingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message: "username already taken"
            }, {status:400})
        }
        
        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "user already exists with this email"
                },{status:400})
            }
            else{
                const hasedPasword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hasedPasword;
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        }
        else{
            const hasedPasword = await bcrypt.hash(password,10)
            const expiryDate = new Date() // here we are using new so that we can get object, therefore expiryDate is object
            expiryDate.setHours(expiryDate.getHours()+1) // so here we can modifiy it


            const newUser = new UserModel({
                username,
                email,
                password: hasedPasword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save()
        }

        // send verification email

        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{status:500})
        }
        return Response.json({
            success: true,
            message: "User register successfully please verify your email"
        },{status:201})
    } catch (error) {
        console.error("error registering user") // this will be shown in terminal
        return Response.json
        (
            {// this will go to front end 
                success: false,
                message: "error registering user"
            },
            {
                status: 500
            }
        )
    }
}