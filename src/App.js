import React from "react";
import PrivateRoutes from "./routes/PrivateRoutes";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
//import "@flaticon/flaticon-uicons/css/all/all.css";

function App() {
  return (
    <>
      <PrivateRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
