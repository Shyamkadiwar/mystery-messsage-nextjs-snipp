// we use this schema for further validation before going to moongose or db 

import {z} from 'zod'

export const usernameValidation = z
    .string()
    .min(2,"username must me 2 char")
    .max(20,"must be less than 20 char") //also u ca give regex and all

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message:"invalid email address"}),
    password: z.string().min(6,{message:"password must be atleast 6 char"})
})