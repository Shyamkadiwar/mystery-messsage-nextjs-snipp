// for better understanding read doc or watch video of nextauth
// Authentication Providers in NextAuth.js are services that can be used to sign in a user.
// There are four ways a user can be signed in:
// Using a built-in OAuth Provider (e.g Github, Twitter, Google, etc...)
// Using a custom OAuth Provider
// Using Email
// Using Credentials

//everything is done through the doc no need to remember it


// Callbacks are asynchronous functions you can use to control what happens when an action is performed.

// Callbacks are extremely powerful, especially in scenarios involving JSON Web Tokens as they allow you to implement access controls without a database and to integrate with external databases or APIs.


import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export const authOptions: NextAuthOptions = {
    providers : [
        CredentialsProvider({
            id:"credentials",
            name:"Credentials",
            credentials: {
                email: { label: "Email", type: "text" }, // we can access this through credentials.identifier.email
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials:any):Promise<any>{
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email : credentials.identifier},
                            {username : credentials.identifier},
                        ]
                    })

                    if(!user){
                        throw new Error("No user found with this email")
                    }
                    if(!user.isVerified){
                        throw new Error("please verify your account first")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if(isPasswordCorrect){
                        return user  // this return will got to the provider 
                    }
                    else{
                        throw new Error("incorrect password")    
                    }
                } catch (error:any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks:{
        async jwt({ token, user}) {
            if(user){
                // we are here adding more info to the token so that we dont have to9 hit the db query repeadtly
                token._id = user._id?.toString() // we will redifine or modify user type in nextauth type folder because we are gewtting error
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
    },
    pages : {
        signIn : '/sign-in'
    },
    session:{
        strategy:"jwt"
    },
    secret : process.env.NEXTAUTH_SECRET,

}