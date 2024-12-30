import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()
    try {
        const {username, email, password} = await request.json()        
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