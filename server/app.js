import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'C:\\Users\\vighnesh\\Documents\\upload_file\\.env' });
import multer from 'multer';
import path from 'path';
import request from 'request';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './db/connect.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleWare.js';
import cookieParser from 'cookie-parser';
import chatRouter from './routes/chatRoute.js';
import ChatModel from './model/chatModel.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send("Server is ready!");
});

app.use('/api/users', userRoutes);
app.use('/api/chat/', chatRouter);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', protect, upload.single('file'), async function (req, res) {
  console.log(req.user);
  console.log("req.file", req.file)
  const userId = req.user._id;
  // const fileName = req.body.name;
  const filePath = req.file.path;
  const fileName = req.file.originalname.replace(/\.pdf$/i, '');
 
  // const filenameWithoutExtension = filename;
  console.log('File path:', filePath);

  // Create a new instance of ChatModel
  try {
    const newChat = new ChatModel();
    await newChat.save();
    const chatId = newChat._id;
    console.log('New Chat ID:', chatId);
    const dbName = `${fileName}_${chatId}_db`;

    // Send the file path to the Flask server
    request.post({
      url: 'http://127.0.0.1:5000/process_file',
      json: { filePath: filePath, dbName }
    }, async function (error, response, body) {
      if (error || response.statusCode===500) {
        console.error('error:', error);
        res.status(500).send('Internal Server Error');
      } else {
        newChat.dbName = dbName;
        newChat.userId = userId;
        try {
          await newChat.save();
          console.log("body:", body);
          console.log("response:", response);
          res.status(200).send({message:"Successfully indexed the documents", db:dbName});
        } catch (saveError) {
          console.error('Error saving chat with dbName and userId:', saveError);
          res.status(500).send('Internal Server Error');
        }
      }
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).send('Internal Server Error');
  }
});

connectDB();

app.listen(PORT, function () {
  console.log(`Listening on Port ${PORT}`);
});
