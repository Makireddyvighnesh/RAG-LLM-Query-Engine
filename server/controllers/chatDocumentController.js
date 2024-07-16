import request from 'request';
import User from "../model/userModel.js";
// import jwt from "jsonwebtoken";
import Conversation from '../model/conversationModel.js';
import Message from '../model/messageModel.js';

const getDBs = async (req, res) => {
    console.log("getDBs: ");
    console.log(req.user._id);
    try {
        const dbs = await Conversation.find({ userId: req.user._id }, { dbName: 1 , rootId:1,_id:0});
        // const dbNames = dbs.map(item => item.dbName);
        console.log(dbs);

        res.status(200).json({ dbName: dbs });
    } catch (error) {
        res.status(400).json(error);
    }
};
const getLastConversation = async (rootId, messages,childrenLength) => {
    try {
        console.log(rootId);
        const message = await Message.findOne(
            { _id: rootId },
            { _id: 1, question: 1, response: 1, parentId: 1, children: 1 }
        );
        console.log("message: ",message)
        if (!message) return;

        // Add childrenLength to the message
        
        const index = childrenLength;
        const msg = { ...message.toObject(), childrenLength, index };

        messages.push(msg);

        childrenLength = message.children.length;

        // Recursively fetch children messages
        if (message.children.length > 0) {
            await getLastConversation(message.children[message.children.length - 1], messages,childrenLength);
        }
    } catch (error) {
        throw error; // Propagate the error up
    }
};

const getQueries = async (req, res) => {
    let { rootId } = req.params;
    let index = parseInt(req.params.index) || 0;

    console.log("rootId: ", rootId);
    console.log("index: ", index);

    try {
        let childrenLength=0;
        if (index !== 0) {
            const rootChat = await Message.findOne({ _id: rootId }, { children: 1 });
            console.log(rootChat)
            rootId = rootChat.children[index-1];
            console.log("Adjusted rootId: ", rootId);
            childrenLength=rootChat.children.length;

        }

        const messages = [];
        
        await getLastConversation(rootId, messages, childrenLength);
        messages[0].index=index;

        console.log("Messages: ", messages);
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getQueries:", error);
        res.status(400).json({ error: error.message });
    }
};


const indexDoc = async (req, res) => {
    console.log("Index doc:");
    console.log(req.params);
    const {db}=req.params;
    try {
        request.post({
            url: 'http://127.0.0.1:5000/index',
            json: { dbName: db }
        }, async (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Internal Server Error');
            }
            try {
                res.status(200).json({ message: "Documents are indexed successfully!" });
            } catch (error) {
                res.status(404).json(error);
            }
        });
    } catch (error) {
        res.status(404).json(error);
    }
};

const createQuery = async (req, res) => {
    console.log("createQuery");
    try {
        console.log("query", req.user);
        const { query, dbName, parentId=null } = req.body;
        console.log(req.body);
        request.post({
            url: 'http://127.0.0.1:5000/document/query',
            json: { query: query, dbName }
        }, async (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Internal Server Error');
            }
            console.log(body)
            try {
                const conversationId= await Conversation.findOne({dbName:dbName});
                console.log("conversationId ",conversationId)
                let message = await Message.create({ conversationId:conversationId._id, question:query, response:body.response,parentId });
                
                console.log("Filled message is: ", message);

                if(parentId===null){
                    conversationId.rootId.push(message._id);
                    await conversationId.save();
                } else{
                    const parentMessage = await Message.findById({_id:parentId});
                    parentMessage.children.push(message._id);
                    await parentMessage.save();
                }

                message.childrenLength = conversationId.rootId.length;
                message.save();
                message = {_id:message._id, conversationId:message.conversationId, question:message.question, response:message.response, parentId:message.parentId}
                res.status(200).send(message);
            } catch (err) {
                res.status(500).send('Error saving to database');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

const deleteRecurChats = async (rootId) => {
    const chat = await Message.findOne({ _id: rootId });

    if (!chat) return; // Return if the chat is not found

    // Delete children first
    await Promise.all(chat.children.map(async (childId) => {
        console.log(childId);
        await deleteRecurChats(childId);
    }));

    // Delete the current chat
    const deletedChat = await Message.deleteOne({ _id: rootId });
    console.log(deletedChat);
};

const deleteConversation = async (req, res) => {
    const { dbName } = req.params;
    try {
        const conversation = await Conversation.findOne({ dbName: dbName });
        if (!conversation) {
            return res.status(404).send("Conversation not found");
        }
        const rootId = conversation.rootId;
        await deleteRecurChats(rootId);

        // await Conversation.deleteOne({dbName});

        console.log(`Deleted ${conversation.conversationName} Conversation chats`);
        res.status(200).send("Deleted");
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};


const deleteChat = async(req, res)=>{
    const {dbName}=req.params;
    console.log("deleting the chat: ", dbName)
    try {
        await Query.deleteOne({dbName});
        await ChatModel.deleteOne({dbName});
        console.log(`Deleted ${dbName} successfully`);
        res.status(200).send("Deleted db successfully");
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
}


// const editQuery = async()=>{
//     // const 
//     try {
        
//     } catch (error) {
        
//     }
// }

export { getDBs, createQuery, getQueries, indexDoc, deleteChat, deleteConversation };
