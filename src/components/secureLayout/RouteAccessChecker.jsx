import { useSelector } from "react-redux";
import AccessDeniedComponent from "./accessDeniedComponent";
import PageLoader from "../pageLoader"; // Assuming you have this component

const { useRouter } = require("next/router");

const RouteAccessChecker = ({ children }) => {
  const router = useRouter();
  const {
    allowedRoutes: loginAllowedRoute = [],
    userRoles,
    isPermissionsLoaded,
  } = useSelector((state) => state.common);

  const allowedRoutes = [
    "login",
    "signup",
    "reset-password",
    "verify-email",
    "kyc-verification",
    "dashboard",
    ...(Array.isArray(loginAllowedRoute) ? loginAllowedRoute : []),
  ];

  // Get current path and extract base route
  const getCurrentBaseRoute = (pathname) => {
    // Remove leading slash and get first segment
    const cleanPath = pathname.replace(/^\//, "");
    const firstSegment = cleanPath.split("/")[0];
    return firstSegment;
  };

  const checkRouteAccess = (pathname, allowedRoutes) => {
    // Handle null/undefined inputs
    if (!pathname || !allowedRoutes || !Array.isArray(allowedRoutes)) {
      return false;
    }

    // Get base route from current path
    const baseRoute = getCurrentBaseRoute(pathname);

    // Check if base route is in allowed routes
    return allowedRoutes.includes(baseRoute);
  };

  // Check if permissions are still loading
  const isPermissionsLoading = () => {
    // Check if permissions haven't been loaded yet
    return !isPermissionsLoaded || allowedRoutes === null || userRoles === null;
  };

  // Show loading while permissions are being fetched
  if (isPermissionsLoading()) {
    return <PageLoader />;
  }

  const hasAccess = checkRouteAccess(router.pathname, allowedRoutes);

  // If no access, show Access Denied component
  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  // If has access, render children
  return children;
};

export default RouteAccessChecker;
