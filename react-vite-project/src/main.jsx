import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import ServiceHolder from "./components/ServiceHolder.jsx";
import '../i18n.config.js';

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <ServiceHolder>
                <App />
            </ServiceHolder>
        </BrowserRouter>
    </React.StrictMode>
);