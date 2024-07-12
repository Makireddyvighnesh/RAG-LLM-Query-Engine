import { useNavigate } from 'react-router-dom';
import App from '../components/Chat/app.jsx';

function Home() {
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo');
  if(!userInfo){
     navigate('/login');
    //  alert(!userInfo)
    //  return null;
    }
  

  return (
    <main >
      <App />
    </main>
  );
}

export default Home;
