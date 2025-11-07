// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import CreateCampaign from "./pages/CreateCampaign";
import Shortlist from "./pages/Shortlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import RootLayout from "./layouts/RootLayout";
import CampaignAnalytics from "./pages/CampaignAnalytics";
import AiFollowUp from "./pages/FollowUp";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "",
        element: (
          <RequireAuth>
            <App />
          </RequireAuth>
        ),
        children: [
          { path: "", element: <CreateCampaign /> },
          { path: "shortlist", element: <Shortlist /> },
          { path: "analytics", element: <CampaignAnalytics />},
          { path: "followup", element: <AiFollowUp />}
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
