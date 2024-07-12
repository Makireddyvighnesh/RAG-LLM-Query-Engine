import mongoose from "mongoose";

const QuerySchema = new mongoose.Schema({
    dbName:{
        type:String,
        required:true,
    },
    queries: {
        type: [String],  // Assuming queries are stored as strings
        required: true,
    },
    responses: {
        type: [String],  // Storing only response strings
        required: true,
    },
})

const Query = mongoose.model('Query',QuerySchema );

export default Query;