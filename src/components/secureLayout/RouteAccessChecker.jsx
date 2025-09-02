import { useSelector } from "react-redux";
import AccessDeniedComponent from "./accessDeniedComponent";
import PageLoader from "../pageLoader"; // Assuming you have this component

const { useRouter } = require("next/router");

const RouteAccessChecker = ({ children }) => {
  const router = useRouter();
  const {
    allowedRoutes: dynamicAllowedRoutes, // from redux (can be null while loading)
    userRoles,
    isPermissionsLoaded,
  } = useSelector((state) => state.common);

  // Base public/always-accessible root route segments
  const baseAllowedRoutes = [
    "login",
    "signup",
    "reset-password",
    "verify-email",
    "kyc-verification",
    "dashboard",
    "settings", // needed so /settings/kyc etc. don't flash Access Denied before dynamic routes load
  ];

  // Merge and de-duplicate
  const effectiveAllowedRoutes = Array.from(
    new Set([
      ...baseAllowedRoutes,
      ...(Array.isArray(dynamicAllowedRoutes) ? dynamicAllowedRoutes : []),
    ])
  );

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
    // while roles loading OR dynamic routes still null treat as loading
    return !isPermissionsLoaded || userRoles === null || dynamicAllowedRoutes === null;
  };

  // Show loading while permissions are being fetched
  if (isPermissionsLoading()) {
    return <PageLoader />;
  }

  const hasAccess = checkRouteAccess(router.pathname, effectiveAllowedRoutes);

  // If no access, show Access Denied component
  if (!hasAccess) {
    return <AccessDeniedComponent />;
  }

  // If has access, render children
  return children;
};

export default RouteAccessChecker;
