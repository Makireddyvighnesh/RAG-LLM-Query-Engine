import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        // required: true,
    },
    conversationName:{
        type:String,
    },
    rootId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:'InteractionChat'
    }
}, {
    timestamps:true
});

const Interaction = mongoose.model('Interaction', interactionSchema);

export default Interaction;
