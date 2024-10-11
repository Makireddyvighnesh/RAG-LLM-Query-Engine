import Header from "./components/Auth/Header.jsx";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <>
    <Header />
    <ToastContainer />
    <Container>
      <Outlet />
    </Container>
    </>
  )
}

export default App
