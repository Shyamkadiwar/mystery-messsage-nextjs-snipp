import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import z from 'zod'
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({username:usernameValidation})

export async function GET(request : Request) {

    await dbConnect()
    
    try {
        // localhost:9000/api/che?username=12?j=0 // this below code will extarct user param from url
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        // console.log(result);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []//This code retrieves the list of _errors associated with the username field from the formatted error object of result, typically used in validation frameworks like Zod.
            return Response.json(
                {
                    success:false,
                    message:usernameErrors?.length>0 ? usernameErrors.join(', ') : "invalid query parameter"
                },
                {status:400}
            )
        }

        const {username} = result.data

        const existingVerifiedUser = await UserModel.findOne({username, isVerified:true})
        if(existingVerifiedUser){
            return Response.json(
                {
                    success:false,
                    message:"Username is already taken"
                },
                {status:400}
            )
        }
        return Response.json(
            {
                success:true,
                message:"Username is available"
            },
            {status:200}
        )
        

    } catch (error) {
        console.error("error checking username",error)
        return Response.json(
            {
                success:false,
                message:"error checking username"
            },
            {status:500}
        )
    }
}
