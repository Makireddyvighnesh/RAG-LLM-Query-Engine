// App.jsx
import ChatBox from './ChatBox.jsx';
import ChatHistory from './ChatHistory.jsx';
import FileUpload from './FileUpload.jsx';
import './App.css';
import { useChat } from '../../contexts/ChatContext.jsx';

export default function App() {
  const {
    dbs,
    newChat,

  } = useChat();

  return (
    <div className="app-container">
      {dbs.length ? (
        <>
          <ChatHistory
            
          />
          {!newChat ? (
            <ChatBox />
          ) : (
            <FileUpload />
          )}
        </>
      ) : (
        <FileUpload />
      )}
    </div>
  );
}
