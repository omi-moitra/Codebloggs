import { Nav } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

// Route protection is handled by RequireAuth in App.jsx — this component does not re-check it.
const Admin = () => {
  return (
    <section className="admin-shell">
      <Nav variant="tabs" className="admin-shell__tabs">
        <Nav.Item>
          {/* No `end` prop — keeps the tab active on /admin/users/:id so the admin
              always sees which section they're in while editing a user. */}
          <Nav.Link as={NavLink} to="/admin/users" className="admin-shell__tab-link">
            User Manager
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={NavLink} to="/admin/content" end className="admin-shell__tab-link">
            Content Manager
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="admin-shell__content">
        <Outlet />
      </div>
    </section>
  );
};

export default Admin;
