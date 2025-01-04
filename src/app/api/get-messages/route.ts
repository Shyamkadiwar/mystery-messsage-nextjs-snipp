import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message: "User not authenticated"
            },
            {status : 400}
        )
    }

    const userId = new mongoose.Types.ObjectId(user._id) // did this because we get user as a string as we code this in option.ts

    try {
        
        const user = await UserModel.aggregate([
            { $match : {id: userId} },
            { $unwind : '$messages' }, // we are unwind the messages array for better understanding check image in public folder
            { $sort : {'messages.createdAt': -1} },
            { $group : {_id: '$_id', messages: {$push: '$messages'}} }
        ])

        if(!user || user.length === 0){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status : 400}
            )
        }

        return Response.json(
            {
                success: true,
                message: "message retrive successfull",
                messages : user[0].messages
            },
            {status : 400}
        )

    } catch (error) {
        
    }
}