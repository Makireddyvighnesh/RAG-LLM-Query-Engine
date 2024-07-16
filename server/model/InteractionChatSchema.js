import mongoose from "mongoose";

const InteractionChatSchema = new mongoose.Schema({
    conversationId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Interaction', 
      required: true },
    question:String,
    response:String,
    parentId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'InteractionChat', 
        default:null,
    },
    children:[{type:mongoose.Schema.Types.ObjectId, 
      ref:'InteractionChat'}],
    
},{
    timestamps:true,
});


const InteractionChat = mongoose.model('InteractionChat',InteractionChatSchema );

export default InteractionChat;