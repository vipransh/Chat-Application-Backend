import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import indexRouter from './routes/indexRoute.js'
import fileUpload from 'express-fileupload'
import { Server } from 'socket.io';
import config from './config/envconfig.js'
import http from 'http';
const PORT=config.PORT || 5000;

const app=express()
const server = http.createServer(app);
connectDB();


app.use(fileUpload({
    useTempFiles: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser())
app.use(morgan('tiny'))


app.use("/api/v1",indexRouter);

app.get("/",(req,res)=>{
    res.send("Welcome to chat backend")
})

 server.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})


const io = new Server (server,{ 
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
 });

//  io.listen(4000)

 io.on("connection", (socket)=>{
    console.log("connected to socket.io");

    socket.on("setup",(userData)=>{
        if(userData){
            socket.join(userData.user?._id);
        console.log(userData.user?._id);
        socket.emit("connected")
        }
    })

    socket.on("join room",(room)=>{
        if(room){
            socket.join(room);
            console.log("user joined room:",room);
        }
    })

    socket.on("typing", (room)=> socket.in(room).emit("typing"));
    socket.on("typing stopped", (room)=> socket.in(room).emit("typing stopped"));

    socket.on("new message", (newMessageRecieved)=>{
        if(newMessageRecieved){
            const chat=newMessageRecieved.chat;

            if(!chat.users) return console.log("chat.users not defined")

            chat.users.forEach((user) => {
                if(user._id==newMessageRecieved.sender._id) return;

                socket.in(user._id).emit("message recieved", newMessageRecieved);
            });
        }
    })
 })


