import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/home", label: "Home" },
  { to: "/blogs", label: "Blogs" },
  { to: "/network", label: "Network" },
  { to: "/admin", label: "Admin", adminOnly: true },
];

const Sidebar = () => {
  const { user } = useAuth();
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.auth_level === "admin"
  );

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <Nav className="app-sidebar__nav">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? " app-sidebar__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </Nav>
    </aside>
  );
};

export default Sidebar;
