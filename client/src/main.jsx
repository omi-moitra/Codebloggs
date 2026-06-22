import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./layout/MainLayout";
import store from "./redux/store";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Blogs from "./pages/Blogs";
import Network from "./pages/Network";
import Admin from "./pages/Admin";
import UserManager from "./pages/UserManager";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      // Login and Register are public because guests need to reach them before
      // they have a session, so they render without Header or Sidebar.
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        // Protected routes wait for server session validation before deciding
        // whether to render app pages or redirect guests to login.
        element: <RequireAuth />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "home", element: <Home /> },
              { path: "blogs", element: <Blogs /> },
              { path: "network", element: <Network /> },
              { path: "settings", element: <AccountSettings /> },
              {
                // ⚠️ Admin routes are double-guarded: the outer RequireAuth
                // checks authentication; this inner RequireAuth checks for the
                // admin role (auth_level === "admin"). Non-admins are sent to /home.
                element: <RequireAuth requireAdmin redirectTo="/home" />,
                children: [
                  {
                    path: "admin",
                    element: <Admin />,  // AdminShell — renders tabs + <Outlet>
                    children: [
                      // /admin with no sub-path redirects to /admin/users.
                      { index: true, element: <Navigate to="/admin/users" replace /> },
                      { path: "users", element: <UserManager /> },
                      // /admin/users/:id — placeholder until user-update.feature.md
                      // is implemented. The route must exist so Edit links in
                      // UserManager navigate without a 404.
                      {
                        path: "users/:id",
                        element: (
                          <div className="p-3 text-muted">
                            User Update — coming soon (user-update.feature.md).
                          </div>
                        ),
                      },
                      // /admin/content — placeholder until content-manager.feature.md
                      // is implemented.
                      {
                        path: "content",
                        element: (
                          <div className="p-3 text-muted">
                            Content Manager — coming soon (content-manager.feature.md).
                          </div>
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
