import { useEffect, useState } from "react";
import axios from 'axios';
import ChatBox from "./ChatBox.jsx";
import ChatHistory from "./ChatHistory.jsx";
import './App.css';
import FileUpload from "./FileUpload.jsx";
import StartOptions from "./StartOptions.jsx";

export default function App() {
  const [dbs, setDbs] = useState([]);
  const [currDB, setCurrDB] = useState('');
  const [messages, setMessages] = useState({ queries: [], responses: [] });
  const [newChat, setNewChat] = useState(true); // For New Chats
  const [click, setClick]=useState(false); 
  const [docIndexedID, setDocIndexedID] = useState('');
  
  // Adding Query to UI on User Click
  const handleSend = (query) => {
    setMessages((prevMessages) => ({
      ...prevMessages,
      queries: [...prevMessages.queries, query],
    }));
  };

  // Adding response to UI on response from LLM
  const addMessage = (query, response) => {
    setMessages((prevMessages) => ({
      queries: [...prevMessages.queries],
      responses: [...prevMessages.responses, response]
    }));
  };

  // Fetching User History of chats
  const getDBs = async () => {
    console.log('Fetching the dbs.....');
    try {
      const res = await axios.get('http://localhost:3000/api/chat/dbs/', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.data.dbName) {
        setDbs([...res.data.dbName].reverse());
        // setCurrDB(res.data.dbName[res.data.dbName.length-1]);
      }
      console.log(res.data.dbName[res.data.dbName.length-1])
      // handleChat(res.data.dbName[res.data.dbName.length-1])
    } catch (error) {
      console.log(error);
    }
  };

  // Fetching user Messages with LLMs when user clicks on some past history chats
  const handleChat= async (db, clicked='') => {
    setNewChat(false)
    console.log(`current Db(chat) is: ${currDB}`)
    console.log(`Selected db is: ${db}`)

    console.log("clicked ",clicked)
    if(clicked!=='' && currDB === db) return;
    if(clicked === 'click') setClick(true);

    setCurrDB(db);
    try {
      console.log('Make chat request');
      const res = await axios.get('http://localhost:3000/api/chat/', {
        params: {
          dbName: db,
        },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if(res.data.queries?.length>0){
        setMessages({
        queries: [...res.data.queries],
        responses: [...res.data.responses],
      });
    }
      console.log('Messages are ', res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleIndexedDoc = (db)=>{
    console.log(docIndexedID)
    console.log("setting indexed db: ", db)
    setDocIndexedID(db);

  }

  // rendering NewChat when user clicks NewChat button
  const handleNewChat = ()=>{
    // if(newChat) return;
    setNewChat(true);
    alert(newChat);
  }

  // Storing the upploaded pdf 
  const handleNewChatDb = (db)=>{
    setDocIndexedID(db);
    setDbs(dbs=>[db, ...dbs]);
    setCurrDB(db);
    setMessages({ queries: [], responses: [] });
    console.log("Current Db is: ", db)
  }

  const handleEditQuery=(index)=>{
    alert(index);
    alert(messages.queries[index]);
  }

  const handleDeleteChat = async (db) => {
    console.log("deleting chat ", db);
    try {
      console.log('Make chat request');
      const res = await axios.delete(`http://localhost:3000/api/chat/deleteChat/${db}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (res.status === 200) {
        setDbs((prevDbs) => {
          return prevDbs.filter(id => db !== id);
        });
      }
  
      console.log("Deleted db: ", dbs);
    } catch (err) {
      console.log(err);
    }
  };
  

  useEffect(() => {
    getDBs();
  }, []);

  console.log(newChat)

  return (
    <div className="app-container" >
    
     {dbs.length ? <>
        <ChatHistory dbs={dbs} onNewChat={handleNewChat} handleChat={handleChat} onDeleteChat={handleDeleteChat}/>
        {!newChat ?<ChatBox  messages={messages} handleSend={handleSend} addMessage={addMessage} currDB={currDB}  docIndexedID={docIndexedID} handleIndexedDoc={handleIndexedDoc} handleEditQuery={handleEditQuery}/>:
          <FileUpload onNewChat={handleNewChat} handleNewChatDb={handleNewChatDb} />}
          </>:
          <FileUpload onNewChat={handleNewChat} handleNewChatDb={handleNewChatDb} />
        }
     
    </div>
  );
}
