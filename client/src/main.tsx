import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./i18n"; // Import i18n configuration

// Disable blur/backdrop-blur globally for sharper UI (can be toggled by removing this class)
document.documentElement.classList.add('no-blur');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
