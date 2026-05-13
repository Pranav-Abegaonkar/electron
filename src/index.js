import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <ToastContainer
      toastClassName={(context) =>
        `${context?.defaultClassName} relative flex py-3 px-4 rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#EEEEEE] shadow-[0_4px_16px_rgba(0,0,0,0.10)]`
      }
      bodyClassName={(context) =>
        `${context?.defaultClassName} text-[#1B1C27] text-sm font-semibold font-poppins`
      }
      position="bottom-left"
      autoClose={4000}
      hideProgressBar={true}
      newestOnTop={false}
      closeButton={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    <App />
  </>
);
