import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.$oid || value);
};

const HomeRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={`/home/${getId(user?._id)}`} replace />;
};

export default HomeRedirect;
