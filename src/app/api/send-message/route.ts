import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { User } from "next-auth";
export async function POST(request: Request) {
    await dbConnect()

    // here message can be sent by anyone so no need to authenticate thats what this web is made for
    const {username, content} = await request.json()

    try {
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status : 400}
            )
        }
        // is user is accepting the messages
        if(user.isAcceptingMessage){
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting the messages"
                },
                {status : 400}
            )
        }

        const newMessage = {content, createdAt: new Date()}
        user.messages.push(newMessage as Message) // we get here ts error if we do not give type thats why we have imported messae
        await user.save()

        return Response.json(
            {
                success: true,
                message: "message sent successfully"
            },
            {status : 200}
        )

    } catch (error) {
        console.error("error sending message", error)
        return Response.json(
            {
                success: false,
                message: "error sending message"
            },
            {status : 500}
        )
    }

}