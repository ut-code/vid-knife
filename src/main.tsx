import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { RecoilRoot } from "recoil";
import App from "./App";
import "./index.css";
import ThemeProvider from "./common/theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>
);
