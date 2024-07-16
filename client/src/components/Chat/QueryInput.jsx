import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './ChatInput.css';
import axios from 'axios';

function ChatInput({ onSend, addMessage, currDB, docIndexedID, handleIndexedDoc, currParentId, onQuery }) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current.focus();
  }, []);

  const handleInput = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    adjustTextareaHeight();
    console.log("current Db: ", currDB);
    console.log("Indexed Db: ", docIndexedID);
    if (inputValue.length > 1 && currDB !== docIndexedID) {
      handleIndexedDoc(currDB);
      handleIndex(currDB);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set height based on scroll height
  };

  const handleIndex = async (db) => {
    console.log("handleDocIndex");
    alert(db);
    try {
      const res = await axios.get(`http://localhost:3000/api/chat/index/${db}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res);
      console.log("You can start your queries with LLM!");
    } catch (error) {
      console.error('Error:', error);
    }

    console.log("Indexing the DB", db);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.length < 3) {
      return;
    }
    setQuery('');
    adjustTextareaHeight(); // Reset textarea height

    console.log("query", query);
    await onQuery(query, currDB, currParentId);
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        value={query}
        onChange={handleInput}
        placeholder="Type your query..."
        className="chat-input-field"
        ref={textareaRef}
        style={{ minHeight: '40px', maxHeight: '200px', resize: 'none', overflowY: 'auto' }}
      />
      <button type="submit" className="chat-input-submit">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
}

export default ChatInput;
