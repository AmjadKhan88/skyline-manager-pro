import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./app.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GlobalProvider } from "./context/GlobalContext.jsx";
import { store } from "./app/store.js";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

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
        <Provider store={store}>
          <App />
        </Provider>
      </GlobalProvider>
    </BrowserRouter>
  </ErrorBoundary>,
);
