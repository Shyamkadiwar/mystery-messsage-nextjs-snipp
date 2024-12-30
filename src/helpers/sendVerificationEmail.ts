import {resend} from "@/lib/resend"
import verificationEmail from "../../emails/verificationEmail"
import { ApiResponse } from "@/types/ApiResponse"

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
):Promise<ApiResponse>{
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystery message verification code',
            react: verificationEmail({ username, otp:verifyCode }),
          });
        return {success:false, message:"verification email send successfully"}
    } catch (emailError) {
        console.error("error sending verofocation email")
        return {success:false, message:"failed to send verification email"}
    }
}