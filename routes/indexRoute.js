import express from 'express';
const indexRouter=express.Router();



import authRouter from './authRoute.js';
import chatRouter from './chatRoute.js';
import messageRouter from './messageRoute.js';

indexRouter.use('/auth', authRouter);
indexRouter.use('/chat', chatRouter);
indexRouter.use('/message', messageRouter);

export default indexRouter;