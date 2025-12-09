import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { Home } from "./pages/Home";
import { Subreddit } from "./pages/Subreddit";
import { PostDetail } from "./pages/PostDetail";
import { Shell } from "./components/Shell";
import { CreateSubreddit } from "./pages/CreateSubreddit";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<App />} />
        <Route
          path="/"
          element={
            <Shell>
              <Home />
            </Shell>
          }
        />
        <Route
          path="/create-subreddit"
          element={
            <Shell>
              <CreateSubreddit />
            </Shell>
          }
        />
        <Route
          path="/r/:slug"
          element={
            <Shell>
              <Subreddit />
            </Shell>
          }
        />
        <Route
          path="/posts/:id"
          element={
            <Shell>
              <PostDetail />
            </Shell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

