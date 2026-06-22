// =============================================================================
// pages/Admin.jsx — Admin Page Shell (layout for all /admin sub-pages)
// -----------------------------------------------------------------------------
// 1. Tab navigation     <Nav variant="tabs"> linking User Manager / Content Manager
// 2. Outlet             renders the active child route (UserManager, ContentManager)
// =============================================================================

import { Nav } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";

// Admin is the shell that wraps every /admin/* page. It renders the tab bar
// at the top and an <Outlet> below where child routes paint their content.
// Route protection (admin-only) is handled by RequireAuth in main.jsx — this
// component does not re-check the role on every render.
const Admin = () => {
  return (
    <section className="admin-shell">
      <Nav variant="tabs" className="admin-shell__tabs">
        <Nav.Item>
          {/* NavLink automatically adds the "active" class when /admin/users
              is the current route, which Bootstrap's .nav-tabs styles pick up.
              No `end` prop — the tab stays active on /admin/users/:id (User
              Update) so the admin always knows which section they're in. */}
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
