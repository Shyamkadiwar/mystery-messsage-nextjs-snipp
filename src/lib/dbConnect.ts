import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection:ConnectionObject = {}

async function dbConnect():Promise<void> { //here void mean we dont care about what type of data we are returning
    if(connection.isConnected){
        console.log("already connected to database");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})
        connection.isConnected = db.connections[0].readyState  //this will just return is our db is connected or not
        console.log("DB connected successfully");
    } catch (error) {
        console.log("Database connection failed",error);
        process.exit(1); // exit if db is not connected
    }
}

export default dbConnect;