import './chatHistory.css';

function ChatHistory({ dbs, onNewChat, handleChat, onDeleteChat }) {
  console.log(dbs)
  return (
    <div>
      <div className='container'>
        <p className='p'>
          Chat History
        </p>
        <p className='p' onClick={()=>onNewChat()}>
          New Chat
        </p>
      </div>

      <div style={{ marginLeft: '10px', padding: '3px' }}>
        {dbs.map((db) => (
          <div key={db} style={{ borderColor: '#f8f9fa', backgroundColor: '#f8f9fa' , cursor:'pointer', display:'flex', justifyContent:'space-between'}}
            
          >
            <p onClick={()=>{
              handleChat({db:db.dbName,rootId:db.rootId[db.rootId.length-1], clicked:'click',len:db.rootId.length});
              }}>{db.dbName.substring(0,25)}...</p>
            <p className='p' onClick={()=>onDeleteChat(db.dbName)}>delete</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatHistory;
