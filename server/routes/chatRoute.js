import express from 'express';
import { getQueries, createQuery, getDBs, indexDoc, deleteConversation } from '../controllers/chatDocumentController.js';
import { protect } from '../middleware/authMiddleware.js';

const chatRouter = express.Router();

// chatRouter.get('/retrieve_index', retrieveIndexes);
chatRouter.get('/index/:db', indexDoc);
chatRouter.get('/dbs', protect, getDBs);
chatRouter.post('/query',protect, createQuery);
chatRouter.get('/:rootId/:index?',protect, getQueries);
// chatRouter.delete('/deleteChat/:dbName', deleteChat);
chatRouter.delete('/deleteConversation/:dbName',deleteConversation);

export default chatRouter;