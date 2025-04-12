import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure the document has a title matching Nadex
document.title = "Nadex - Trade Binary Options, Call Spreads, and Knock-Outs";

createRoot(document.getElementById("root")!).render(<App />);
