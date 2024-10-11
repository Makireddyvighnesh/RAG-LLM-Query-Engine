import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [dbs, setDbs] = useState([{ dbName: '', rootId: [] }]);
  const [currDB, setCurrDB] = useState('');
  const [messages, setMessages] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [docIndexedID, setDocIndexedID] = useState('');
  const [currParentId, setCurrParentId] = useState(null);

  const getDBs = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/chat/dbs/', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.data.dbName) {
        setDbs(res.data.dbName.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChat = async ({ db, rootId, clicked = '', len, index, startIndex, incre = false }) => {
    if (rootId === null) {
      const targetObject = dbs.find((obj) => obj.dbName === currDB);
      rootId = !incre
        ? targetObject.rootId[targetObject.rootId.length - index - 1]
        : targetObject.rootId[index - 1];
    }
    setNewChat(false);
    if (clicked !== '' && currDB === db) return;
    if (db) setCurrDB(db);
    try {
      let url = `http://localhost:3000/api/chat/${rootId}/`;

      if (index !== undefined && index !== null && startIndex) {
        url += `${index}`;
      }
      const res = await axios.get(url, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (clicked !== '' || startIndex === 0) {
        res.data[0].childrenLength = len;
        res.data[0].index = index || len;
      }

      if (index) {
        const slicedMessages = messages.splice(0, startIndex);
        setMessages([...slicedMessages, ...res.data]);
      } else {
        setMessages(res.data);
      }
      setCurrParentId(res.data[res.data.length - 1]._id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleIndexedDoc = (db) => {
    setDocIndexedID(db);
  };

  const handleNewChat = () => {
    setNewChat(true);
  };

  const handleNewChatDb = (db) => {
    setDocIndexedID(db.dbName);
    setDbs((dbs) => [db, ...dbs]);
    setCurrDB(db.dbName);
    // setMessages({ queries: [], responses: [] });
    setMessages([]);
    setCurrParentId(null);
  };

  

  const handleCreateQuery = async (query, currDB, currParentId, i = '', childrenLength) => {
    // Add the user's query to the messages with a temporary "Loading..." response

    const tempId = `temp-${Date.now()}`;

    const tempMessage = {
      question: query,
      response: 'Loading...', // Temporary placeholder for the LLM response
      parentId: currParentId,
      childrenLength: childrenLength || 0,
      _id: tempId, // A temporary unique ID
      index:i||0,
      children:[]
    };

    if(messages.length===0){
      setMessages(tempMessage);
      // alert("Ipdates")
    }
    else if(i!==''){
      // alert("update")
      // removeObjectsFromIndex(startIndex);
      const slicedMessages = messages.slice(0,i);
      // if(i) slicedMessages[slicedMessages.length-1].children.push(res.data._id);
      setMessages([...slicedMessages, tempMessage])
      // childrenLength=slicedMessages[slicedMessages.length-1].children.length;
      // // alert(`childrenlength: ${childrenLength}`)
      // console.log("slicedMessages ",slicedMessages)
      // res.data.childrenLength=childrenLength+1;
      // res.data.index=childrenLength+1;
      // setMessages([...slicedMessages, tempMessage]);
      // alert("updated")
    } else {
      // messages[messages.length-1].children.push();
      // setMessages(res.data);
      setMessages((prevMessages) => ([
        ...prevMessages, tempMessage
      ]));
    }

    // Optimistically add the user's query to the chat
    // setMessages(prevMessages => [...prevMessages, tempMessage]);

    try {
      const res = await axios.post(
        'http://localhost:3000/api/chat/query',
        {
          query: query,
          dbName: currDB,
          parentId: currParentId,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // // After receiving the response, update the temporary message with the actual response
      setMessages(prevMessages => prevMessages.map(msg => 
        msg._id === tempMessage._id ? { ...msg, response: res.data.response } : msg
      ));

      if(i!=''){
        const slicedMessages = messages.slice(0,i);
        if(i) slicedMessages[slicedMessages.length-1].children.push(res.data._id);
        childrenLength=slicedMessages[slicedMessages.length-1].children.length;
        // alert(`childrenlength: ${childrenLength}`)
        console.log("slicedMessages ",slicedMessages)
        res.data.childrenLength=childrenLength+1;
        res.data.index=childrenLength+1;
        setMessages([...slicedMessages, res.data]);
      }
      
      // setCurrParentId(res.data._id);

      // if(messages.length===0){
      //   setMessages(res.data);
      //   // alert("Ipdates")
      // }
      // else if(i!==''){
      //   // alert("update")
      //   // removeObjectsFromIndex(startIndex);
      //   const slicedMessages = messages.slice(0,i);
      //   if(i) slicedMessages[slicedMessages.length-1].children.push(res.data._id);
      //   childrenLength=slicedMessages[slicedMessages.length-1].children.length;
      //   // alert(`childrenlength: ${childrenLength}`)
      //   console.log("slicedMessages ",slicedMessages)
      //   res.data.childrenLength=childrenLength+1;
      //   res.data.index=childrenLength+1;
      //   setMessages([...slicedMessages, res.data]);
      //   // alert("updated")
      // } else {
      //   messages[messages.length-1].children.push(res.data._id);
      //   // setMessages(res.data);
      //   setMessages((prevMessages) => ([
      //     ...prevMessages, res.data
      //   ]));
      // }
      // messages[-1]
      setCurrParentId(res.data._id);
    } catch (error) {
      console.error('Error:', error);
      
      // Handle error and update the temporary message with an error state
      setMessages(prevMessages => prevMessages.map(msg => 
        msg._id === tempMessage._id ? { ...msg, response: 'Error fetching response' } : msg
      ));
    }
  };

  const handleDeleteChat = async (db) => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/chat/deleteConversation/${db}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200) {
        setDbs((prevDbs) => prevDbs.filter((id) => db !== id.dbName));
        setMessages([]);
        setCurrParentId(null);
        setCurrDB('');
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getDBs();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        dbs,
        currDB,
        messages,
        newChat,
        docIndexedID,
        currParentId,
        handleChat,
        handleCreateQuery,
        handleIndexedDoc,
        handleNewChat,
        handleNewChatDb,
        handleDeleteChat,
        setMessages,
        setCurrDB,
        setNewChat,
        setDocIndexedID,
        setCurrParentId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChat = () => {
  return useContext(ChatContext);
};

export { ChatProvider, useChat };
