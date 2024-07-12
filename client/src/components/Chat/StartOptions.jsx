import { useState } from 'react';
import FileUpload from './FileUpload.jsx';
// import './StartOptions.css';

const StartOptions = ({ onNewChat, handleNewChatDb}) => {
  const [option, setOption] = useState(null);

  const handleOptionClick = (selectedOption) => {
    setOption(selectedOption);
  };

  return (
    <div className="start-options-container">
      {!option ? (
        <>
          <span>Would you like to chat using your document or chat directly with the Assistant (LLM)?</span>
          <div className="start-options-buttons">
            <button onClick={() => handleOptionClick('chat')}>Chat with Assistant</button>
            <button onClick={() => handleOptionClick('upload')}>Chat using Document</button>
          </div>
        </>
      ) : option === 'upload' ? (
        <FileUpload onNewChat={onNewChat} handleNewChatDb={handleNewChatDb} />
      ) : (
        <div className="chat-placeholder">Start your chat with the Assistant...</div> // Placeholder for chat start
      )}
    </div>
  );
};

export default StartOptions;
