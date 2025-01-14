import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function DELETE(request: Request, {params} : {params: {messageid : string}}  ) {
    
    const messageId = params.messageid
    
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

    try {
        const updatedResult = await UserModel.updateOne(
            {_id : user._id},
            {$pull : {messages: {_id : messageId}}}
        )
        if(updatedResult.modifiedCount == 0){
            return Response.json(
                {
                    success: false,
                    message: "message not found or deleted"
                },
                {status : 400}
            )
        }
        return Response.json(
            {
                success: false,
                message: "User not authenticated"
            },
            {status : 400}
        )
    } catch (error) {
        console.log("error in delete message route", error)
        return Response.json(
            {
                success: false,
                message: "error in deleting message"
            },
            {status : 500}
        )        
    }
    
}