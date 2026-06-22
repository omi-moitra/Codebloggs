import PropTypes from "prop-types";
import { usePresence } from "../context/PresenceContext";

// A small glowing dot indicating whether a user is online right now. Presence
// comes from PresenceContext (polled ~every 30s). `placement` controls styling:
//   - "corner": absolutely positioned over the bottom-right of an avatar
//               (the avatar's wrapper must be position: relative)
//   - "below":  a normal block element, e.g. centered under a profile picture
//   - "inline": sits inline next to text (e.g. a "STATUS:" label)
const StatusDot = ({ userId, placement }) => {
  const { isActive } = usePresence();
  const active = isActive(userId);
  const label = active ? "Active" : "Offline";

  return (
    <span
      aria-label={label}
      className={`status-dot status-dot--${placement} ${
        active ? "status-dot--active" : "status-dot--offline"
      }`}
      role="img"
      title={label}
    />
  );
};

StatusDot.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  placement: PropTypes.oneOf(["corner", "below", "inline"]),
};

StatusDot.defaultProps = {
  userId: "",
  placement: "corner",
};

export default StatusDot;
