import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    question:String,
    response:String,
    parentId:{
        type:mongoose.Schema.Types.ObjectId, ref:'Message', default:null,
    },
    children:[{type:mongoose.Schema.Types.ObjectId, ref:'Message'}],
    
},{
    timestamps:true,
});


const Message = mongoose.model('Message',messageSchema );

export default Message;