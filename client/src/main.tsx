import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./app.css";
import { BrowserRouter } from "react-router-dom";
import { GlobalProvider } from "./context/GlobalContext";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary
    boundaryName="AppRoot"
    isFullScreen={true}
    onError={(error, errorInfo) => {
      // Optional: Track errors in analytics
      console.log("App root error captured:", error);
    }}
  >
    <BrowserRouter>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </BrowserRouter>
  </ErrorBoundary>,
);
