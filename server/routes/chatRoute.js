import express from 'express';
import { getQueries, createQuery, getDBs, indexDoc, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const chatRouter = express.Router();

// chatRouter.get('/retrieve_index', retrieveIndexes);
chatRouter.get('/index/:db', indexDoc);
chatRouter.get('/dbs', protect, getDBs);
chatRouter.post('/query',protect, createQuery);
chatRouter.get('/',protect, getQueries);
chatRouter.delete('/deleteChat/:dbName', deleteChat);

export default chatRouter;