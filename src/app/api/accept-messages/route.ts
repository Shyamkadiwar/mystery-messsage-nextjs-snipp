import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request:Request) {
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

    const userId = user._id

    const {acceptingMessage} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage:acceptingMessage},
            {new:true} // this will help us to return new updated value
        )

        if(!updatedUser){
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status to update accept status"
                },
                {status : 400}
            )
        }

        return Response.json(
            {
                success: true,
                message: "message accept status updated successfully"
            },
            {status : 200}
        )
    } catch (error) {
        console.error("Failed to update user status to update accept status")
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to update accept status"
            },
            {status : 500}
        )
    }
}

export async function GET(request:Request) {

    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User 

    if(!session || !session.user){
        return Response.json(
            {
                success: false,
                message : "User not found"
            },
            {status: 400}
        )
    }

    const userId = user?._id

    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 400}
            )    
        }

        return Response.json(
            {
                success: true,
                message: "Failed to get user",
                isAcceptingMessage: foundUser.isAcceptingMessage
            },
            {status: 200}
        )
    } catch (error) {
        console.error("Failed to get User", error)
        return Response.json(
            {
                success: false,
                message: "Failed to get user"
            },
            {status: 500}
        )
    }
}