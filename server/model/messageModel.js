import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    question: { type: String },
    response: { type: mongoose.Schema.Types.Mixed },  // Allows for string, object, or any other type
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, {
    timestamps: true,
});

const Message = mongoose.model('Message',messageSchema );

export default Message;