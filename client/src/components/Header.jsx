// =============================================================================
// Header.jsx — App-wide top navigation bar
// -----------------------------------------------------------------------------
// 1. NAV_ITEMS        shared nav link definitions (mirrored in Sidebar.jsx)
// 2. Header           main component
//    2a. navExpanded  controlled state for close-on-navigate behaviour
//    2b. Navbar       header shell with expand="lg" for hamburger support
//    2c. Brand        logo link (always visible)
//    2d. app-header__session
//        - Navbar.Toggle  hamburger button (d-lg-none — hidden on desktop)
//        - Post button    (d-none d-lg-inline-block — desktop only)
//        - Theme toggle   (d-none d-md-inline-flex — tablet + desktop)
//        - Profile menu   (always visible)
//    2e. Navbar.Collapse  push-down mobile nav dropdown (d-lg-none on inner Nav)
// =============================================================================

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { FiMoon, FiSun } from "react-icons/fi";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProfileAvatar from "./ProfileAvatar";
import codebloggsLogo from "../assets/CodeBloggs logo.png";

// Nav items are defined here so the mobile dropdown uses the same set as Sidebar.
// adminOnly items are filtered out for non-admin users in both places.
const NAV_ITEMS = [
  { to: "/home", label: "Home" },
  { to: "/blogs", label: "Blogs" },
  { to: "/network", label: "Network" },
  { to: "/admin", label: "Admin", adminOnly: true },
];

const Header = ({ onAccountSettings, onOpenPostModal }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Controlled expand state so we can close the dropdown on nav-link click.
  // Bootstrap's onToggle fires when the hamburger is clicked; we mirror that
  // state here and also set it to false whenever a link is selected.
  const [navExpanded, setNavExpanded] = useState(false);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email || "Account";

  // ⚠️ Admin-only link is filtered client-side; the admin route itself is still
  // protected server-side. Hiding it here is a UX convenience only.
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.auth_level === "admin"
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Navbar
      className="app-header"
      expand="lg"
      expanded={navExpanded}
      onToggle={setNavExpanded}
      variant="dark"
    >
      <Container fluid className="px-4">
        <Navbar.Brand as={NavLink} to="/home" className="app-header__brand">
          <img src={codebloggsLogo} alt="CodeBloggs" className="app-header__logo" />
        </Navbar.Brand>

        {/* Right-side header controls — stay in the header row at all breakpoints.
            ms-auto pushes this div to the right edge; navbar-expand-lg changes
            Bootstrap's container to justify-content: flex-start, so without ms-auto
            everything would cluster against the logo.
            DOM order: Toggle → Post → Theme → Profile mirrors the visual spec at
            each breakpoint (hamburger appears left of theme icon on tablet/mobile). */}
        <div className="app-header__session ms-auto">
          {/* Hamburger — Bootstrap hides this at lg+ via navbar-expand-lg CSS;
              d-lg-none is a belt-and-suspenders to survive CSS overrides. */}
          <Navbar.Toggle
            aria-controls="codebloggs-nav"
            aria-label="Toggle navigation"
            className="app-header__hamburger d-lg-none"
          />

          {/* Post button — only meaningful when the sidebar is visible (desktop). */}
          <Button
            className="app-header__post d-none d-lg-inline-block"
            onClick={onOpenPostModal}
            size="sm"
            type="button"
            variant="light"
          >
            Post
          </Button>

          {/* Theme toggle — hidden on mobile; still useful on tablet where the
              sidebar is gone and users may still want to switch themes. */}
          <Button
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="app-header__theme-toggle d-none d-md-inline-flex"
            onClick={toggleTheme}
            size="sm"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            type="button"
            variant="outline-light"
          >
            {isDarkMode ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </Button>

          <Dropdown align="end" className="app-header__profile-menu">
            <Dropdown.Toggle
              aria-label={`${displayName} profile menu`}
              className="app-header__profile-toggle"
              id="app-header-profile-menu"
              variant="outline-light"
            >
              <ProfileAvatar className="app-header__avatar" user={user} />
              {/* Username text — hidden below desktop; avatar icon always shows. */}
              <span className="app-header__user d-none d-lg-inline">{displayName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu
              aria-labelledby="app-header-profile-menu"
              className="app-header__dropdown"
            >
              <Dropdown.Item as="button" onClick={onAccountSettings}>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={handleLogout}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Mobile/tablet nav dropdown — Bootstrap expand="lg" auto-expands this
            at desktop, but d-lg-none on the inner Nav hides the links in the
            header at desktop (the sidebar column already shows them there).
            Placing the Collapse after the session div makes it a full-width row
            in the flex container when open, pushing below the header controls. */}
        <Navbar.Collapse id="codebloggs-nav">
          <Nav
            className="flex-column app-header__mobile-nav d-lg-none"
            onSelect={() => setNavExpanded(false)}
          >
            {visibleNavItems.map((item) => (
              <Nav.Link
                key={item.to}
                as={NavLink}
                to={item.to}
                onClick={() => setNavExpanded(false)}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

Header.propTypes = {
  onAccountSettings: PropTypes.func.isRequired,
  onOpenPostModal: PropTypes.func.isRequired,
};

export default Header;
