// ChatBox.jsx
import { useChat } from '../../contexts/ChatContext.jsx';
import ChatInput from './QueryInput';
import ChatMessage from './ChatMessage';
import { useEffect, useRef } from 'react';
import './ChatBox.css';

function ChatBox() {
  const { messages, currDB } = useChat();  // Ensure messages is always an array

  const chatContainerRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [currDB, messages]); // Trigger scroll effect whenever 'messages' or 'currDB' changes

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
            key={message._id}
            message={message}
            i={index}
          />
        ))}
      </div>
      <ChatInput />
    </div>
  );
}

export default ChatBox;
