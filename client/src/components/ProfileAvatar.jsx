import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  getProfilePicUrl,
  getProfilePicVersion,
  PROFILE_PICTURE_UPDATED_EVENT,
} from "../services/profilePicService";

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.$oid || String(value);
};

const getInitials = (user, fallbackInitials = "") => {
  const first = user?.first_name?.trim()?.[0] || "";
  const last = user?.last_name?.trim()?.[0] || "";
  const email = user?.email?.trim()?.[0] || "";

  return (
    `${first}${last}`.toUpperCase() ||
    email.toUpperCase() ||
    fallbackInitials.toUpperCase() ||
    "CB"
  );
};

const getDisplayName = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.email || "CodeBloggs user";
};

const ProfileAvatar = ({ cacheKey, className, fallbackInitials, previewUrl, user }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const userId = getId(user?._id);
  const [storedCacheKey, setStoredCacheKey] = useState(() => getProfilePicVersion(userId));
  const effectiveCacheKey = cacheKey || storedCacheKey;
  const imageUrl = previewUrl || getProfilePicUrl(userId, effectiveCacheKey);
  const displayName = getDisplayName(user);

  useEffect(() => {
    const handleProfilePicUpdated = (event) => {
      const eventUserId = getId(event.detail?.userId);

      if (eventUserId && eventUserId !== userId) {
        return;
      }

      setStoredCacheKey(event.detail?.cacheKey || getProfilePicVersion(userId) || Date.now());
    };

    setStoredCacheKey(getProfilePicVersion(userId));
    window.addEventListener(PROFILE_PICTURE_UPDATED_EVENT, handleProfilePicUpdated);

    return () => {
      window.removeEventListener(PROFILE_PICTURE_UPDATED_EVENT, handleProfilePicUpdated);
    };
  }, [userId]);

  useEffect(() => {
    setImageFailed(false);
  }, [effectiveCacheKey, imageUrl, userId]);

  return (
    <div
      aria-label={`${displayName} profile picture`}
      className={`profile-avatar ${className || ""}`.trim()}
      title={displayName}
    >
      {imageUrl && !imageFailed ? (
        <img
          alt=""
          className="profile-avatar__image"
          onError={() => setImageFailed(true)}
          src={imageUrl}
        />
      ) : (
        <span className="profile-avatar__initials">
          {getInitials(user, fallbackInitials)}
        </span>
      )}
    </div>
  );
};

ProfileAvatar.propTypes = {
  cacheKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  fallbackInitials: PropTypes.string,
  previewUrl: PropTypes.string,
  user: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};

ProfileAvatar.defaultProps = {
  cacheKey: "",
  className: "",
  fallbackInitials: "",
  previewUrl: "",
  user: null,
};

export default ProfileAvatar;
