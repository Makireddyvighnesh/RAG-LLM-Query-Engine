import React, { useState, useRef, useEffect } from 'react';
import './ChatMessage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

function ChatMessage({ message, i, handleEditQuery, handleChat, currDB }) {
  const [isEdit, setIsEdit] = useState(false);
  const [editQuestion, setEditQuestion] = useState('');
  const { query, response, parentId, childrenLength, index: currIndex } = message;
  const inputRef = useRef(null);

  const handleEdit = (query) => {
    setIsEdit(true);
    setEditQuestion(query);
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(editQuestion);
    setIsEdit(false);
    handleEditQuery(editQuestion,currDB, parentId , i, childrenLength)
  };

  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEdit]);

  return (
    <div className="chat-message">
    {/* <p>{childrenLength} {currIndex} {i} {parentId}</p> */}
      {!isEdit ? (<div style={{ display: 'flex', alignItems: 'center', justifyContent: isEdit ? 'flex-start' : 'flex-end', marginBottom:'20px' }}>
        
          <FontAwesomeIcon
            icon={faEdit}
            style={{ marginRight: '10px', paddingBottom: '15px', cursor: 'pointer' }}
            onClick={() => handleEdit(query)}
          />
            <p><strong>Question:</strong> {query}</p>
            {/* <p>{parentId}</p> */}

        
        </div>):
      
        <div className="message user-message" style={{ textAlign: isEdit ? 'left' : 'right', marginRight: '10px', width: '100%' }}>
          
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f1f1f1', padding: '10px', width: '100%' }}>
              <textarea
                type="text"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                ref={inputRef}
                style={{minHeight: '40px', maxHeight: '200px', resize: 'none', overflowY: 'auto', outline:'none',border: '0px', backgroundColor: '#f1f1f1', padding: '10px', width: '100%', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => {
                  setIsEdit(false);
                  setEditQuestion('');
                  }} style={{color:'white', border: 'none', borderRadius:'9999px', backgroundColor: '#2d3439', padding: '10px', cursor: 'pointer' , marginRight:'20px'}}>
                  Cancel
                </button>
                <button onClick={handleSubmit} style={{ border: 'none', color:'black',backgroundColor: '#d6dee0',borderRadius:'9999px', padding: '10px',  cursor: 'pointer' }}>
                  Send
                </button>
              </div>
            </div>
           
      </div>}

      <div className="message ai-message">
        {childrenLength > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              style={{ cursor: 'pointer', fontSize: '20px', margin: '10px', border: 'none' }}
              onClick={() => handleChat({ rootId: parentId, index: currIndex - 1 , startIndex:i, len:childrenLength})}
            >
              &lt;
            </button>
            <span style={{ paddingTop: '13px' }}>{currIndex}/{childrenLength}</span>
            <button
              style={{ cursor: 'pointer', fontSize: '20px', margin: '10px', border: 'none' }}
              onClick={() => handleChat({ rootId: parentId, index: currIndex + 1, startIndex:i, len:childrenLength, incre:true })}
            >
              &gt;
            </button>
          </div>
        )}
        <p style={{ whiteSpace: 'pre-wrap' }}><strong>Response:</strong> {response}</p>
      </div>
    </div>
  );
}

export default ChatMessage;
