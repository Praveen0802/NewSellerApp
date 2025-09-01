import {
  fetchProfileDetails,
  getKYCStatus,
  getUserRoleAccess,
} from "@/utils/apiHandler/request";
import { hideHeaderPages, hideLeftMenuPages } from "@/utils/constants/contants";
import {
  allowedRoutValues,
  updateConfirmPurchasePopup,
  updatedKYCStatus,
  updatedLeftPanelValues,
  updateRoleAccess,
  updateWalletPopupFlag,
} from "@/utils/redux/common/action";
import { updateCurrentUser } from "@/utils/redux/currentUser/action";
import { hidepageLoader, showpageLoader } from "@/utils/redux/loader/action";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import addSquare from "../../../public/add-square.svg";
import arrowRight from "../../../public/arrow-right.svg";
import Bulkticket from "../../../public/Bulkticket.svg";
import category from "../../../public/category.svg";
import diagram from "../../../public/diagram.svg";
import leftMenuTicket from "../../../public/leftMenuTicket.svg";
import listing from "../../../public/listing.svg";
import shopping from "../../../public/shopping-cart-02.svg";
import AddDepositSummary from "../addDepositSummary";
import RightViewModal from "../commonComponents/rightViewModal";
import ConfirmPurchasePopup from "../confirmPurchasePopup";
import Header from "../header";
import LeftMenuBar from "../leftMenuBar";
import PageLoader from "../pageLoader";
import { ArrowRight, Bell, ChevronLeft } from "lucide-react";
import RouteAccessChecker from "./RouteAccessChecker";

const LeftArrowIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const SecureLayout = ({ children }) => {
  const router = useRouter();
  const hideLeftMenu = hideLeftMenuPages?.includes(router?.pathname);
  const hideHeader = hideHeaderPages?.includes(router?.pathname);
  const dispatch = useDispatch();

  const { pageLoader } = useSelector((state) => state.pageLoader);
  const {
    addWalletflag,
    confirmPurchasePopupFields,
    notificationCountData,
    showFullDisplay,
    userRoles,
    isPermissionsLoaded
  } = useSelector((state) => state.common);
  useEffect(() => {
    // dispatch(showpageLoader());
    const handleStart = () => dispatch(showpageLoader());
    const handleComplete = () => dispatch(hidepageLoader());

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);
  const { currentUser } = useSelector((state) => state.currentUser);
  const name = currentUser?.first_name?.slice(0, 2).toUpperCase();
  const userName = currentUser?.first_name;

  const salesSubItems = [
    {
      name: "Pending",
      route: "sales/pending",
      key: "sales-pending",
      // count: salesCount?.find((item) => item.status === "pending")?.orders || 0,
    },
    {
      name: "Awaiting Delivery",
      route: "sales/confirmed",
      key: "sales-confirmed",
      // count: salesCount?.find((item) => item.status === "confirmed")?.orders || 0,
    },
    {
      name: "Delivered",
      route: "sales/delivered",
      key: "sales-delivered",
      // count: salesCount?.find((item) => item.status === "delivered")?.orders || 0,
    },
    {
      name: "Completed",
      route: "sales/completed",
      key: "sales-completed",
      // count: salesCount?.find((item) => item.status === "completed")?.orders || 0,
    },
    {
      name: "Cancelled",
      route: "sales/cancelled",
      key: "sales-cancelled",
      // count: salesCount?.find((item) => item.status === "cancelled")?.orders || 0,
    },
    {
      name: "Replaced",
      route: "sales/replaced",
      key: "sales-replaced",
      // count: salesCount?.find((item) => item.status === "replaced")?.orders || 0,
    },
  ];
  console.log(showFullDisplay, "showFullDisplayshowFullDisplay");
  const fetchUserName = async () => {
    const response = await fetchProfileDetails();
    dispatch(updateCurrentUser(response));
  };

  function getUnReadNotificationCount(notificationCountData) {
    const notification = Number(notificationCountData?.notification) || 0;
    const activity = Number(notificationCountData?.activity) || 0;

    return notification;
  }

  const leftFullPaneValues = [
    {
      // image: showFullDisplay ? "" : arrowRight,
      icon: showFullDisplay ? (
        <ChevronLeft className="size-5 text-white" />
      ) : (
        <ArrowRight className="size-5 text-white" />
      ),
      name: "Minimise",
    },
    {
      text: name,
      name: userName,
      key: "name",
      isName: true,
      canAccessKey: "settings",
      // route: "settings/myAccount",
      allowedRoutes: ["settings"],
    },
    {
      image: category,
      name: "Dashboard",
      route: "dashboard",
      key: "dashboard",
      canAccessKey: "dashboard",
      allowedRoutes: ["dashboard"],
    },
    {
      icon: <Bell className="size-6 w-[23px] text-white" />,
      name: "Notifications",
      key: "notifications",
      isNotification: true,
      badge: getUnReadNotificationCount(notificationCountData),
      canAccessKey: "notification",
      allowedRoutes: ["notifications"],
    },
    {
      image: addSquare,
      name: "Add Listings",
      key: "add-listings",
      route: "add-listings",
      canAccessKey: "event",
      allowedRoutes: ["add-listings"],
    },
    {
      image: listing,
      name: "My Listings",
      key: "my-listings",
      route: "my-listings",
      canAccessKey: "event",
      allowedRoutes: ["my-listings"],
    },
    {
      image: Bulkticket,
      name: "Bulk Listings",
      key: "bulk-listings",
      route: "bulk-listings",
      canAccessKey: "event",
      allowedRoutes: ["bulk-listings"],
    },
    {
      image: shopping,
      name: "Sales",
      key: "sales",
      canAccessKey: "sales",
      hasSubItems: true,
      route: "sales/pending",
      subItems: salesSubItems,
      allowedRoutes: ["sales"],
    },
    {
      image: leftMenuTicket,
      name: "Reports",
      key: "report-history",
      canAccessKey: "reports",
      route: "report-history",
      allowedRoutes: ["report-history"],
    },
    {
      image: diagram,
      name: "Wallet",
      key: "reports",
      canAccessKey: "lmt-pay",
      route: "reports/wallet",
      allowedRoutes: ["reports"],
    },
    {
      image: Bulkticket,
      name: "SB Trade",
      canAccessKey: "lmt-trade",
      key: "sb-trade",
      route: "trade/home",
      allowedRoutes: ["trade"],
    },
  ];

  const extractAllowedRoutes = (leftValues) => {
    const allowedRoutes = new Set();

    leftValues.forEach((item) => {
      if (item.allowedRoutes && Array.isArray(item.allowedRoutes)) {
        item.allowedRoutes.forEach((route) => {
          allowedRoutes.add(route);
        });
      }
    });

    return Array.from(allowedRoutes);
  };

  function filterLeftPaneByAccess(leftPaneValues, userRoles = []) {
    // Handle null/undefined inputs
    if (!leftPaneValues || !Array.isArray(leftPaneValues)) {
      return [];
    }

    if (!userRoles || !Array.isArray(userRoles)) {
      userRoles = [];
    }

    // Create a lookup object for faster access checking
    const accessLookup = userRoles.reduce((acc, role) => {
      // Handle null/undefined role or role.name
      if (role && role.name) {
        acc[role.name] = role.is_can_access === 1;
      }
      return acc;
    }, {});

    // Filter the left pane values
    return leftPaneValues.filter((item) => {
      // Handle null/undefined item
      if (!item) {
        return false;
      }

      // If no canAccessKey is specified, include the item
      if (!item.canAccessKey) {
        return true;
      }

      // Check if user has access to this item
      return accessLookup[item.canAccessKey] === true;
    });
  }

  const getUserCanAccessRoles = async () => {
    try {
      const response = await getUserRoleAccess();
      const kycResponse = await getKYCStatus();

      // Dispatch user roles first - this will set isPermissionsLoaded to true
      dispatch(updateRoleAccess(response));
      dispatch(updatedKYCStatus(kycResponse));

      // Handle KYC redirect logic
      if (
        (kycResponse?.kyc_status == 0 || kycResponse?.kyc_status == 2) &&
        !["/settings/kyc"]?.includes(window.location.pathname) &&
        response?.user_type == "sellers"
      ) {
        router.push("/settings/kyc?handle=true");
        return;
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      // Even on error, mark permissions as "loaded" to prevent infinite loading
      dispatch(updateRoleAccess({ permission: [] }));
    }
  };

  useEffect(() => {
    // Only filter and update routes after userRoles are loaded
    if (isPermissionsLoaded && userRoles) {
      const leftValues = filterLeftPaneByAccess(
        leftFullPaneValues,
        userRoles?.permission
      );
      const allowedRoute = extractAllowedRoutes(leftValues);
      dispatch(allowedRoutValues(allowedRoute));
      dispatch(updatedLeftPanelValues(leftValues));
    }
  }, [currentUser, userRoles, showFullDisplay, isPermissionsLoaded]);

  useEffect(() => {
    fetchUserName();
    getUserCanAccessRoles();
    // getUserKYCStatus();
  }, [router]);

  const closeAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: false,
      })
    );
  };

  const closeConfirmPurchasePopup = () => {
    dispatch(
      updateConfirmPurchasePopup({
        flag: false,
        data: {},
      })
    );
  };

  return (
    <>
      <div className="flex h-screen">
        {!hideLeftMenu && <LeftMenuBar />}
        <div
          className={`flex flex-col ${
            hideHeader ? " " : "max-md:pt-20 overflow-hidden"
          } w-full `}
        >
          {!hideHeader && <Header />}
          <div className={`flex-1 ${hideHeader ? "" : "overflow-hidden"}`}>
            {pageLoader ? (
              <PageLoader />
            ) : (
              <RouteAccessChecker>{children}</RouteAccessChecker>
            )}
          </div>
        </div>
        <RightViewModal
          show={addWalletflag}
          onClose={() => {
            closeAddWalletPopup();
          }}
          className={"md:!w-[600px] max-md:!w-full"}
          outSideClickClose={true}
        >
          <AddDepositSummary
            show={addWalletflag}
            onClose={() => {
              closeAddWalletPopup();
            }}
          />
        </RightViewModal>

        <RightViewModal
          show={confirmPurchasePopupFields?.flag}
          onClose={() => {
            closeConfirmPurchasePopup();
          }}
          className={"md:!w-[650px] max-md:!w-full"}
          outSideClickClose={false}
        >
          <ConfirmPurchasePopup onClose={closeConfirmPurchasePopup} />
        </RightViewModal>
      </div>
    </>
  );
};

export default SecureLayout;
