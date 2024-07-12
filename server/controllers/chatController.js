import ChatModel from "../model/chatModel.js";
import request from 'request';
import User from "../model/userModel.js";
// import jwt from "jsonwebtoken";
import Query from "../model/QueryModel.js";

const getDBs = async (req, res) => {
    console.log("getDBs: ");
    // console.log(req.user._id);
    try {
        const dbs = await ChatModel.find({ userId: req.user._id }, { dbName: 1 });
        const dbNames = dbs.map(item => item.dbName[0]);
        console.log(dbs);

        res.status(200).json({ dbName: dbNames });
    } catch (error) {
        res.status(400).json(error);
    }
};

const getQueries = async (req, res) => {
    try {
        console.log("query", req.query);
        const dbName = req.query.dbName;
        const chats = await Query.findOne({ dbName }, { queries: 1, responses: 1 });
        console.log("chats", chats);

        if (!chats) {
            res.status(202).json({ message: "No queries yet!" });
        } else {
            const queries = chats.queries;
            const responses = chats.responses;

            res.status(200).json({ queries, responses });
        }
    } catch (error) {
        res.status(400).json(error);
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
        const { query, dbName } = req.body;
        console.log(req.body);

        request.post({
            url: 'http://127.0.0.1:5000/document/query',
            json: { query: query, dbName }
        }, async (error, response, body) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).send('Internal Server Error');
            }
            try {
                let queryModel = await Query.findOne({ dbName });
                if (!queryModel) {
                    queryModel = new Query({
                        dbName: dbName,
                        queries: [query],
                        responses: [body.response]
                    });
                } else {
                    queryModel.queries.push(query);
                    queryModel.responses.push(body.response);
                }

                await queryModel.save();
                res.send(body);
            } catch (err) {
                console.error('Error saving to database:', err);
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

export { getDBs, createQuery, getQueries, indexDoc, deleteChat };
