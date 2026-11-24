import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme.js";
import DemoRoot from "./DemoRoot.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(<StrictMode><ThemeProvider theme={theme}><CssBaseline /><DemoRoot /></ThemeProvider></StrictMode>);
