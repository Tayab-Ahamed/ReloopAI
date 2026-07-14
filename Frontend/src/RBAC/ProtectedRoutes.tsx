import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Role = "NGO" | "Admin" | "Donor" | "Donar" | "Volunteer" | "Recycler";
type NormalizedRole = "NGO" | "Admin" | "Donor" | "Volunteer" | "Recycler";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

// Normalise legacy "Donar" typo so old accounts still work with the new "Donor" role.
const normaliseRole = (r?: string): NormalizedRole | undefined => {
  if (!r) return undefined;
  if (r === "Donar") return "Donor";
  return r as NormalizedRole;
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLogin } = useAuth();

  if (!isLogin || !user || !user.role) {
    return <Navigate to="/" replace />;
  }

  const effective = normaliseRole(user.role);
  const allow = allowedRoles.map((r) => (r === "Donar" ? "Donor" : r)) as NormalizedRole[];

  if (!effective || !allow.includes(effective)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
