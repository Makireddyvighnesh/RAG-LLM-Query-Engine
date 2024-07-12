import { useState } from 'react';
import axios from 'axios';
import Spinner from '../Spinner.jsx'

const FileUpload = ({ onNewChat ,handleNewChatDb}) => {
  const [isLoading, setIsLoading]=useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  if(isLoading) return <Spinner></Spinner>;

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
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
      if (response.status === 200) onNewChat();
      alert(response.data.db)
      handleNewChatDb(response.data.db);
      console.log(response);
      setMessage('File uploaded successfully');
      setIsLoading(false);
    } catch (error) {
      setMessage('File upload failed');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div style={{ marginLeft: '250px', marginTop: '180px' }}>
      <h2>File Upload</h2>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
