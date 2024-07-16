import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        // required: true,
    },
    dbName:{
        type:String,
        // required:true
    },
    conversationName:{
        type:String,
    },
    rootId:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Message'
      }]

    
}, {
    timestamps:true
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
