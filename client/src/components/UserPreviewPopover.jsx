import React from "react";
import PropTypes from "prop-types";
import { Badge, Button, Popover } from "react-bootstrap";
import ProfileAvatar from "./ProfileAvatar";
import StatusDot from "./StatusDot";
import { usePresence } from "../context/PresenceContext";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.$oid || String(value);
};

const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.email || "CodeBloggs user";
};

const UserPreviewPopover = React.forwardRef(({ user, ...props }, ref) => {
  const { isActive } = usePresence();
  const userId = getId(user?._id);
  const isUserActive = isActive(userId);

  return (
    <Popover ref={ref} id={`user-preview-${userId}`} {...props}>
      <Popover.Body className="user-preview-popover__body">
        <div className="avatar-presence avatar-presence--stacked">
          <ProfileAvatar className="user-preview-popover__avatar" user={user} />
          <div className="home-profile__status">
            <span className="home-profile__status-label">
              STATUS: {isUserActive ? "Active" : "Offline"}
            </span>
            <StatusDot userId={userId} placement="inline" />
          </div>
        </div>

        <p className="user-preview-popover__name">{getDisplayName(user)}</p>

        <div className="home-profile__meta user-preview-popover__meta">
          {user?.occupation ? <span>{user.occupation}</span> : null}
          {user?.location ? <span>{user.location}</span> : null}
          {user?.email ? <span>{user.email}</span> : null}
        </div>

        <Badge bg="secondary" className="home-profile__badge d-block mb-3">
          {user?.auth_level || "basic"} account
        </Badge>

        <Button
          className="w-100"
          onClick={() =>
            window.open(`/users/${userId}`, "_blank", "noopener,noreferrer")
          }
          size="sm"
          variant="primary"
        >
          Open user profile in a new tab
        </Button>
      </Popover.Body>
    </Popover>
  );
});

UserPreviewPopover.displayName = "UserPreviewPopover";

UserPreviewPopover.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    auth_level: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    location: PropTypes.string,
    occupation: PropTypes.string,
  }),
};

UserPreviewPopover.defaultProps = {
  user: null,
};

export default UserPreviewPopover;
