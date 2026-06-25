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
import EditUserPage from "./pages/EditUserPage";
import ContentManager from "./pages/ContentManager";
import AccountSettings from "./pages/AccountSettings";
import UserProfilePage from "./pages/UserProfilePage";
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
                      // /admin/users/:id — Edit User page; implemented in
                      // user-update.feature.md. Protected by the same admin guard
                      // as the parent route so non-admins are redirected to /home.
                      {
                        path: "users/:id",
                        element: <EditUserPage />,
                      },
                      // /admin/content — Content Manager page; implemented in
                      // content-manager.feature.md.
                      {
                        path: "content",
                        element: <ContentManager />,
                      },
                    ],
                  },
                  // /users/:id — Read-only profile view for any user. Admin-only;
                  // opened in a new tab from the UserManager preview popover.
                  { path: "users/:id", element: <UserProfilePage /> },
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
