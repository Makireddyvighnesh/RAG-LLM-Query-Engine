import ChatInput from './QueryInput';
import ChatMessage from './ChatMessage';
import  { useEffect, useRef } from 'react';

import './ChatBox.css';
function ChatBox({messages, handleSend, addMessage, currDB,  docIndexedID, handleIndexedDoc, handleEditQuery}) {
 
  const chatContainerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Trigger scroll effect whenever 'message' prop changes

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };


  return (
    <div className="chat-box" >
      <div className="messages" ref={chatContainerRef}>
        {messages.queries.map((query, index) => (
          <ChatMessage key={index} message={{ query, response: messages.responses[index] }} index={index} handleEditQuery={handleEditQuery}/>
        ))}
      </div>
      <ChatInput onSend={handleSend} addMessage={addMessage} currDB={currDB}  docIndexedID={docIndexedID} handleIndexedDoc={handleIndexedDoc}/>
    </div>
  );
}

export default ChatBox;
