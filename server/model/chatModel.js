import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        // required: true,
    },
    dbName:{
        type:[String], 
        // required:true,
    },

    
}, {
    timestamps:true
});

const ChatModel = mongoose.model('Chat', chatSchema);

export default ChatModel;
