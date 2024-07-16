import { useEffect, useState } from "react";
import axios from 'axios';
import ChatBox from "./ChatBox.jsx";
import ChatHistory from "./ChatHistory.jsx";
import './App.css';
import FileUpload from "./FileUpload.jsx";
import StartOptions from "./StartOptions.jsx";

export default function App() {
  const [dbs, setDbs] = useState([{dbName:"", rootId:[]}]);
  const [currDB, setCurrDB] = useState('');
  const [messages, setMessages] = useState([]);
  const [newChat, setNewChat] = useState(true); // For New Chats
  const [click, setClick]=useState(false); 
  const [docIndexedID, setDocIndexedID] = useState('');
  const [currParentId, setCurrParentId]=useState(null);
  

  // if(messages.length) setCurrParentId(messages[messages.length-1]._id);
  
  // Adding Query to UI on User Click
  const handleSend = (query) => {
    setMessages((prevMessages) => ({
      ...prevMessages,
      
    }));
  };

  // Adding response to UI on response from LLM
  const addMessage = (query, response) => {
    setMessages((prevMessages) => ([
      ...prevMessages, response
    ]));
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

      console.log(res.data.dbName)

      if (res.data.dbName) {
        setDbs(res.data.dbName.reverse())
        // setCurrDB(res.data.dbName[res.data.dbName.length-1]);
      }

      
      // handleChat(res.data.dbName[res.data.dbName.length-1])
    } catch (error) {
      console.log(error);
    }
  };

  // Fetching user Messages with LLMs when user clicks on some past history chats
  const handleChat = async ({ db, rootId, clicked = '', len, index, startIndex, incre=false }) => {
    // alert(`index: ${index}`)
    // alert(clicked)
    if(rootId===null){
      // alert(rootId)
      const targetObject = dbs.find(obj => obj.dbName === currDB);
      rootId=!incre?targetObject.rootId[targetObject.rootId.length-index-1]:targetObject.rootId[index-1];
      // index=0;
    }    
    // alert(`startIndex: ${startIndex}`)
    // alert(`rootId: ${rootId}`);
    
    setNewChat(false);
    if (clicked !== '' && currDB === db) return;
    if (clicked === 'click') setClick(true);
    if (db) setCurrDB(db);
    try {
      console.log('Make chat request');
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
      if (clicked !== '' || startIndex===0) {
        // alert("clicked")
        res.data[0].childrenLength = len;
        res.data[0].index = index || len;
      }
  
      console.log("response: ",res.data);
      
      if(index){
        // alert("update")
        // removeObjectsFromIndex(startIndex);
        const slicedMessages = messages.splice(0,startIndex);
        console.log("slicedMessages ",slicedMessages)
        setMessages([...slicedMessages, ...res.data]);
        // alert("updated")
      } else {
        setMessages(res.data);
      }
      // alert(res.data[res.data.length - 1]._id);
      setCurrParentId(res.data[res.data.length - 1]._id);
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
    // alert(newChat);
  }

  // Storing the upploaded pdf 
  const handleNewChatDb = (db)=>{
    setDocIndexedID(db.dbName);
    setDbs(dbs=>[db, ...dbs]);
    setCurrDB(db.dbName);
    setMessages({ queries: [], responses: [] });
    console.log("Current Db is: ", db)
  }
  
  const handleCreateQuery = async (query, currDB,currParentId, i='', childrenLength) => {
    // Call the onSend function passed as a prop
    // onSend(query);
    // alert(query);
    // alert(currDB)
    // alert(currParentId)
    // alert(`i: ${i}`)
    try {
      // alert(currParentId)
      const res = await axios.post('http://localhost:3000/api/chat/query', {
        query: query,
        dbName: currDB,
        parentId:currParentId
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("response:   ",res.data)
      if(messages.length===0){
        setMessages(res.data);
        // alert("Ipdates")
      }
      else if(i!==''){
        // alert("update")
        // removeObjectsFromIndex(startIndex);
        const slicedMessages = messages.slice(0,i);
        if(i) slicedMessages[slicedMessages.length-1].children.push(res.data._id);
        childrenLength=slicedMessages[slicedMessages.length-1].children.length;
        // alert(`childrenlength: ${childrenLength}`)
        console.log("slicedMessages ",slicedMessages)
        res.data.childrenLength=childrenLength+1;
        res.data.index=childrenLength+1;
        setMessages([...slicedMessages, res.data]);
        // alert("updated")
      } else {
        messages[messages.length-1].children.push(res.data._id);
        // setMessages(res.data);
        setMessages((prevMessages) => ([
          ...prevMessages, res.data
        ]));
      }
      setCurrParentId(res.data._id);

      
      // addMessage(query, res.data); // Assuming addMessage is a function passed as prop
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
  console.log("messages: ",messages)

  

  useEffect(() => {
    getDBs();
  }, []);

  console.log(newChat)

  return (
    <div className="app-container" >
    
     {dbs.length ? <>
        <ChatHistory dbs={dbs} onNewChat={handleNewChat} handleChat={handleChat} onDeleteChat={handleDeleteChat}/>
        {!newChat ?<ChatBox  messages={messages} handleSend={handleSend} addMessage={addMessage} currDB={currDB}  docIndexedID={docIndexedID} handleIndexedDoc={handleIndexedDoc} handleEditQuery={handleCreateQuery} currParentId={currParentId} handleChat={handleChat} onQuery={handleCreateQuery}/>:
          <FileUpload onNewChat={handleNewChat} handleNewChatDb={handleNewChatDb} />}
          </>:
          <FileUpload onNewChat={handleNewChat} handleNewChatDb={handleNewChatDb} />
        }
     
    </div>
  );
}
