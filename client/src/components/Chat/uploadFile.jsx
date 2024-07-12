// import React from 'react'
import { useRef } from 'react';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  { useState } from 'react';
import axios from 'axios';
// import ChatInput from './components/Chat/ChatBox.jsx';

    // const [file, setFile] = useState(null);
    // const [result, setResult] = useState('');

    // const handleFileChange = (event) => {
    //     setFile(event.target.files[0]);
    // };

    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     const formData = new FormData();
    //     formData.append('file', file);

    //     try {
    //         const response = await axios.post('http://localhost:3000/upload', formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         });
    //         setResult(response.data.result);
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //     }
    // };



const uploadFile = () => {

    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        fileInputRef.current.click();
      };
    
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        // Handle file upload logic here
        console.log(file);

      };
          // return (
    //     <div>
    //         {/* <form onSubmit={handleSubmit}>
    //             <input type="file" onChange={handleFileChange} name="file" />
    //             <button type="submit">Upload</button>
    //         </form>
    //         {result && <div>Result: {result}</div>} */}
    //         <QueryInput />
    //     </div>
    // );
// }

// export default App;
  return (
    <div>
    <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} name="file" />
        <button type="submit">Upload</button>
    </form>
      
    </div>
  )
}

export default uploadFile
