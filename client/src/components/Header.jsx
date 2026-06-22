import { NavLink, useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Navbar } from "react-bootstrap";
import { FiMoon, FiSun } from "react-icons/fi";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ProfileAvatar from "./ProfileAvatar";
import codebloggsLogo from "../assets/CodeBloggs logo.png";

const Header = ({ onAccountSettings, onOpenPostModal }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email || "Account";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Navbar className="app-header" variant="dark">
      <Container fluid className="px-4">
        <Navbar.Brand as={NavLink} to="/home" className="app-header__brand">
          <img src={codebloggsLogo} alt="CodeBloggs" className="app-header__logo" />
        </Navbar.Brand>
        <div className="app-header__session">
          <Button
            className="app-header__post"
            onClick={onOpenPostModal}
            size="sm"
            type="button"
            variant="light"
          >
            Post
          </Button>
          <Button
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="app-header__theme-toggle"
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
              <span className="app-header__user">{displayName}</span>
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
      </Container>
    </Navbar>
  );
};

Header.propTypes = {
  onAccountSettings: PropTypes.func.isRequired,
  onOpenPostModal: PropTypes.func.isRequired,
};

export default Header;
