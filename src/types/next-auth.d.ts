import "next-auth";
import { DefaultSession } from "next-auth";

// we will redifine or modify user type because we are gewtting error

declare module 'next-auth'{
    interface User{
        _id? : string 
        isVerified? : boolean 
        isAcceptingMessages? : boolean 
        username? : string 
    }
    interface Session{
        user:{
            _id? : string 
            isVerified? : boolean 
            isAcceptingMessages? : boolean 
            username? : string
        } & DefaultSession['user'] 
    }
}

// this is another method

declare module 'next-auth/jwt'{
    interface JWT{
        _id? : string 
        isVerified? : boolean 
        isAcceptingMessages? : boolean 
        username? : string
    }
}