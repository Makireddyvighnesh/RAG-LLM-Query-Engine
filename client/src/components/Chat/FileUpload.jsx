import { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner.jsx';
import { useChat } from '../../contexts/ChatContext.jsx';

const FileUpload = () => {
  const { handleNewChat, handleNewChatDb } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  
  if (isLoading) return <Spinner />;

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onFileUpload = async (retry = false) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.status);
      if (response.status === 200) handleNewChat();
      alert(response.data.db);
      handleNewChatDb(response.data);
      setMessage('File uploaded successfully');
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      
      // Alert the user about the failure and retry if it's the first attempt
      if (!retry) {
        alert(`File upload failed due to: ${errorMessage}. Retrying...`);
        onFileUpload(true);  // Retry the upload
      } else {
        alert(`File upload failed again due to: ${errorMessage}. Please try again later.`);
      }
      setMessage('File upload failed');
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: '250px', marginTop: '180px' }}>
      <div>
        <h2>File Upload</h2>
        <input type="file" onChange={onFileChange} />
        <button onClick={() => onFileUpload(false)}>
           Upload
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default FileUpload;
