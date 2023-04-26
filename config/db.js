import mongoose from 'mongoose'
import config from './envconfig.js'


const connectDB=async ()=>{
    try {
        const conn = await mongoose.connect(config.MONGODB_URL);

        console.log(`MongoDB Connected: ${conn.connection.host}`);  
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};
export default connectDB;