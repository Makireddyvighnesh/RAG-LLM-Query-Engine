import request from 'request';
import Conversation from '../model/conversationModel.js';
import Message from '../model/messageModel.js';
import {io} from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to Flask WebSocket server');
    // createQuery();
});

socket.on('newToken', (data) => {
    console.log('Received token:', data.token);
    // Handle the received token
});

socket.on('disconnect', () => {
    console.log('Disconnected from Flask WebSocket server');
});

// Get databases
const getDBs = async (req, res) => {
    try {
        const dbs = await Conversation.find({ userId: req.user._id }, { dbName: 1, rootId: 1, _id: 0 });
        res.status(200).json({ dbName: dbs });
    } catch (error) {
        res.status(400).json(error);
    }
};

// Recursively get the last conversation
const getLastConversation = async (rootId, messages, childrenLength) => {
    try {
        const message = await Message.findOne(
            { _id: rootId },
            { _id: 1, question: 1, response: 1, parentId: 1, children: 1 }
        );
        if (!message) return;
        const index = childrenLength;
        const msg = { ...message.toObject(), childrenLength, index };
        messages.push(msg);
        childrenLength = message.children.length;
        if (message.children.length > 0) {
            await getLastConversation(message.children[message.children.length - 1], messages, childrenLength);
        }
    } catch (error) {
        throw error; // Propagate the error up
    }
};



// Get queries
const getQueries = async (req, res) => {
    let { rootId } = req.params;
    let index = parseInt(req.params.index) || 0;
    console.log("Get Queries:\nroot id: ", rootId)
    try {
        let childrenLength = 0;
        if (index !== 0) {
            const rootChat = await Message.findOne({ _id: rootId }, { children: 1 });
            rootId = rootChat.children[index - 1];
            childrenLength = rootChat.children.length;
        }
        const messages = [];
        await getLastConversation(rootId, messages, childrenLength);
        messages[0].index = index;
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getQueries:", error);
        res.status(400).json({ error: error.message });
    }
};

// Index documents
const indexDoc = async (req, res) => {
    const { db } = req.params;
    console.log("The index doc ", db)
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

// Create a query and handle responses
const createQuery = async (req, res) => {
    console.log("createQuery");
    try {
        // console.log("query", req.user);
        const { query, dbName, parentId = null } = req.body;
        // console.log(req.body);
        request.post({
            url: 'http://127.0.0.1:5000/document/query',
            json: { query: query, dbName }
        }, async (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Internal Server Error');
            }
            console.log(body);
            try {
                const conversationId = await Conversation.findOne({ dbName: dbName });
                console.log("conversationId ", conversationId);
                let message = await Message.create({ conversationId: conversationId._id, question: query, response: body, parentId });
                console.log("body.response: ", body)
                console.log("Filled message is: ", message);

                if (parentId === null) {
                    conversationId.rootId.push(message._id);
                    await conversationId.save();
                } else {
                    const parentMessage = await Message.findById({ _id: parentId });
                    parentMessage.children.push(message._id);
                    await parentMessage.save();
                }

                message.childrenLength = conversationId.rootId.length;
                message.save();
                message = { _id: message._id, conversationId: message.conversationId, question: message.question, response: message.response, parentId: message.parentId };
                
                // Emit a WebSocket event with the new message
                console.log('messageCreated', message)
                // socket.emit('messageCreated', message);

                res.status(200).send(message);
            } catch (err) {
                console.log("err: ", err)
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

// Recursively delete conversations
const deleteRecurChats = async (rootId) => {
    const chat = await Message.findOne({ _id: rootId });
    if (!chat) return; // Return if the chat is not found
    await Promise.all(chat.children.map(async (childId) => {
        console.log(childId);
        await deleteRecurChats(childId);
    }));
    const deletedChat = await Message.deleteOne({ _id: rootId });
    console.log(deletedChat);
};

// Delete a conversation
const deleteConversation = async (req, res) => {
    const { dbName } = req.params;
    console.log(req.params);
    try {
        const conversation = await Conversation.findOne({ dbName: dbName });
        if (!conversation) {
            return res.status(404).send("Conversation not found");
        }
        const rootId = conversation.rootId;
        await deleteRecurChats(rootId);
        await Conversation.deleteOne({ dbName: dbName });
        console.log(`Deleted ${conversation.conversationName} Conversation chats`);
        res.status(200).send("Deleted");
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

export { getDBs, createQuery, getQueries, indexDoc, deleteConversation };
