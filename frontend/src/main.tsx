import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Enable global performance mode by default
document.documentElement.classList.add("perf");

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ErrorBoundary>
);
