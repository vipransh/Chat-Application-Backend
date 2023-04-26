import dotenv from "dotenv";

dotenv.config();

const config={
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    MONGODB_URL: process.env.MONGODB_URL,
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
}

export default config;