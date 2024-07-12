// import React from 'react';
import './ChatMessage.css';
// import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';


function ChatMessage({ message, index,handleEditQuery }) {
  console.log(index)
  const { query, response } = message;

  return (
    <div className="chat-message">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent:'flex-end' }}>
        <FontAwesomeIcon icon={faEdit} style={{ marginRight: '10px', paddingBottom:'15px', cursor:'pointer' }} onClick={()=>handleEditQuery(index)}/>
        <div className="message user-message" style={{ textAlign: 'right', marginRight: '10px' }}>
          <p><strong>Question:</strong> {query}</p>
        </div>
  </div>
      
      <div className="message ai-message">
        <p style={{ whiteSpace: 'pre-wrap' }}><strong>Response:</strong> {response}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
