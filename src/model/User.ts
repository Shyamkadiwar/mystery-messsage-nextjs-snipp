import mongoose, {Schema, Document} from "mongoose";

// creating schemas

export interface Message extends Document{ // creting an message interface, using document because at the last schema is stored in db in form of documnet also its like difing structure and using type script for type safty
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({ // here we have using typescript so we have to give schema tye and its formate
    content:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    }
})


export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({ // here we have using typescript so we have to give schema tye and its formate
    username:{
        type: String,
        required: [true,"username is required"],
        trim: true,
        unique: true
    },
    email:{
        type: String,
        required: [true,"email is required"],
        unique: true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "enter valid email"]
    },
    password:{
        type: String,
        required: [true, "password is required"]
    },
    verifyCode:{
        type: String,
        required: [true, "verify code is required"]
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "verify code expiry is required"]
    },
    isVerified:{
        type: Boolean,
        default: true
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true
    },
    messages: [MessageSchema],
})

// here in next js (EDGE TIME FRAMEWORK),its not running all time when it is demanded at that time it will work, it doesnt know is it my web is running for first time or for n time unlike react, react ionly one time initialize the things but next alway and every time initialize it so we check for is it already present

const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User",UserSchema)) // also using type script, after as i.e ts


export default UserModel;