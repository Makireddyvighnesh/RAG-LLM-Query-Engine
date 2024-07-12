import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './ChatInput.css';
import axios from 'axios';

function ChatInput({ onSend, addMessage, currDB, docIndexedID, handleIndexedDoc}) {
  const [query, setQuery] = useState('');
  const inputEl = useRef(null);

  useEffect(() => {
    inputEl.current.focus();
  }, []);

  const handleInput = (e) => {
    console.log(e.target.value)
    setQuery(e.target.value);
    console.log("current Db: ", currDB);
    console.log("Indexed Db: ", docIndexedID);
    if(e.target.value.length>1  && currDB!==docIndexedID){
     
      handleIndexedDoc(currDB);
      handleIndex(currDB);
    }
  };

  const handleIndex = async (db)=>{
    console.log("handleDocIndex")
    alert(db)
    try {
      const res = await axios.get(`http://localhost:3000/api/chat/index/${db}`, {
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res);
      console.log("You can Start ur queries with LLM!")
    } catch (error) {
      console.error('Error:', error);
    }

    console.log("iNDEXING THE DB", db)
    // setIndexDoc(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQuery('');
    if (query.length < 3) {
      return;
    }
    // Call the onSend function passed as a prop
    onSend(query);
    try {
      const res = await axios.post('http://localhost:3000/api/chat/query', {
        query: query,
        dbName: currDB,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res.data.response)
      addMessage(query, res.data.response); // Assuming addMessage is a function passed as prop
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="Type your query..."
        className="chat-input-field"
        ref={inputEl}
      />
      <button type="submit" className="chat-input-submit">
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </form>
  );
}

export default ChatInput;
