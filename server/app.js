import express from 'express';
import multer from 'multer';
import path from 'path';
import request from 'request';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = 3000;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware to parse JSON data
app.use(bodyParser.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, 'uploads/')); // Use absolute path
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), function (req, res) {
    const filePath = req.file.path;
    console.log('File path:', filePath); // Debug log

    // Send the file path to the Flask server
    request.post({
        url: 'http://127.0.0.1:5000/process_file',
        json: { filePath: filePath }
    }, function (error, response, body) {
        if (error) {
            console.error('error:', error); // Print the error
            res.status(500).send('Internal Server Error');
        } else {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the data received
            res.send(body); // Display the response on the website
        }
    });
});

// Endpoint to handle user queries
app.post('/query', function (req, res) {
    const { query } = req.body;

    // Send the query to the Flask server
    request.post({
        url: 'http://127.0.0.1:5000/query',
        json: { query: query }
    }, function (error, response, body) {
        if (error) {
            console.error('error:', error); // Print the error
            res.status(500).send('Internal Server Error');
        } else {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the data received
            res.send(body); // Display the response on the website
        }
    });
});

app.listen(PORT, function () {
    console.log('Listening on Port 3000');
});
