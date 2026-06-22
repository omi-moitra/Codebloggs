import { buildUrl, uploadRequest } from "./apiClient";

export const PROFILE_PICTURE_UPDATED_EVENT = "codebloggs:profile-picture-updated";

const PROFILE_PIC_VERSION_STORAGE_KEY = "codebloggs:profile-picture-versions";

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.$oid || String(value);
};

const readProfilePicVersions = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(PROFILE_PIC_VERSION_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const writeProfilePicVersions = (versions) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PROFILE_PIC_VERSION_STORAGE_KEY, JSON.stringify(versions));
  } catch {
    // Cache busting is a convenience; avatar refresh still works for mounted views.
  }
};

export const uploadProfilePic = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const payload = await uploadRequest("/profile-pic", formData);

  return {
    message: payload?.message || "Profile picture uploaded successfully.",
  };
};

export const getProfilePicVersion = (userId) => {
  const normalizedUserId = getId(userId);

  if (!normalizedUserId) {
    return "";
  }

  return readProfilePicVersions()[normalizedUserId] || "";
};

export const publishProfilePicUpdate = (userId, cacheKey = Date.now()) => {
  const normalizedUserId = getId(userId);
  const normalizedCacheKey = String(cacheKey);

  if (normalizedUserId) {
    const versions = readProfilePicVersions();
    versions[normalizedUserId] = normalizedCacheKey;
    writeProfilePicVersions(versions);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(PROFILE_PICTURE_UPDATED_EVENT, {
        detail: { userId: normalizedUserId, cacheKey: normalizedCacheKey },
      })
    );
  }

  return normalizedCacheKey;
};

export const getProfilePicUrl = (userId, cacheKey = "") => {
  if (!userId) {
    return "";
  }

  const url = buildUrl(`/profile-pic/${userId}`);
  return cacheKey ? `${url}?v=${encodeURIComponent(cacheKey)}` : url;
};
