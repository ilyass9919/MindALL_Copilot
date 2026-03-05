import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { injectGlobalStyles } from "./styles/global";
import App from "./App";

// Inject fonts + global CSS once at startup
injectGlobalStyles();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);