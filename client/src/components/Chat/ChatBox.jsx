import ChatInput from './QueryInput';
import ChatMessage from './ChatMessage';
import { useEffect, useRef } from 'react';

import './ChatBox.css';

function ChatBox({ messages, handleSend, addMessage, currDB, docIndexedID, handleIndexedDoc, handleEditQuery, currParentId, handleChat, onQuery }) {
  // console.log("messages: ", messages);

  const chatContainerRef = useRef(null);
  // alert(`currdb ${currDB}`)

  useEffect(() => {
    // alert(`currDB ${currDB}`)
    scrollToBottom();
  }, [currDB]); // Trigger scroll effect whenever 'messages' prop changes

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat-box">
      <div className="messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <ChatMessage
            key={message.parentId}
            message={{ query: message.question, response: message.response, parentId:message.parentId, _id:message._id, childrenLength:message.childrenLength, index:message.index }}
            i={index}
            handleEditQuery={handleEditQuery}
            handleChat={handleChat}
            onQuery={onQuery}
            currDB={currDB}
          />
        ))}
      </div>
      <ChatInput
        onSend={handleSend}
        addMessage={addMessage}
        currDB={currDB}
        docIndexedID={docIndexedID}
        handleIndexedDoc={handleIndexedDoc}
        currParentId={currParentId}
        onQuery={onQuery}
      />
    </div>
  );
}

export default ChatBox;
