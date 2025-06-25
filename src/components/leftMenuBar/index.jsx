import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public//template-logo.png";
import arrowRight from "../../../public/arrow-right.svg";
import category from "../../../public/category.svg";
import addSquare from "../../../public/add-square.svg";
import diagram from "../../../public/diagram.svg";
import ticket from "../../../public/ticket.svg";
import documentupload from "../../../public/document-upload.svg";
import listing from "../../../public/listing.svg";
import shopping from "../../../public/shopping-cart-02.svg";
import logout from "../../../public/logout.svg";
import Bulkticket from "../../../public/Bulkticket.svg";
import leftArrow from "../../../public/leftArrow.jpg";
import ticketStar from "../../../public/ticket-star.svg";
import { Menu, Bell, ChevronDown, ChevronRight } from "lucide-react";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import { useRouter } from "next/router";
import { setCookie } from "@/utils/helperFunctions/cookie";
// Fix: Check if IconStore export exists, if not, create a fallback
// import { IconStore } from "@/utils/helperFunctions/iconStore";
import { useSelector } from "react-redux";

// Temporary fallback for IconStore.leftArrow if import fails
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

// Notifications Popup Component
const NotificationsPopup = ({ isOpen, onClose, showFullDisplay }) => {
  const [activeTab, setActiveTab] = useState("notifications");
  const router = useRouter();
  const notificationRedict = (notification) => {
    router.push(`/notifications/home`);
    onClose();
  };
  // Static notification data for mobile
  const notifications = [
    {
      id: 1,
      type: "new",
      date: "10 Jun",
      title: "There is a new open order for 2 ticket(s) for Chris Brown",
      subtitle:
        "Cardiff on 19-06-2025 at 16:00. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 2,
      type: "new",
      date: "09 Jun",
      title:
        "There is a new open order for 1 ticket(s) for Billie Eilish Paris",
      subtitle:
        "on 10-06-2025 at 20:30. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 3,
      type: "new",
      date: "26 May",
      title: "There is a new open order for 2 ticket(s) for Tate McRae",
      subtitle:
        "London on 24-06-2025 at 19:30. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 4,
      type: "new",
      date: "23 May",
      title: "There is a new open order for 3 ticket(s) for Billie Eilish",
      subtitle:
        "London on 14-07-2025 at 20:00. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 5,
      type: "new",
      date: "23 May",
      title: "There is a new open order for 2 ticket(s) for Billie Eilish",
      subtitle:
        "London on 14-07-2025 at 20:00. See dashboard if you want to submit an offer.",
      isNew: true,
    },
  ];

  if (!isOpen) return null;

  const sidebarWidth = showFullDisplay ? 200 : 60;

  return (
    <div className="fixed inset-0 z-50 ">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 bg-opacity-50"
        onClick={onClose}
      />

      {/* Popup positioned to span from sidebar to right edge */}
      <div
        className="absolute top-0 bottom-0 w-[300px] bg-white shadow-xl  z-10"
        style={{
          left: `${sidebarWidth}px`,
          right: "20px", // This makes it span to the right edge with 20px margin
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-1 border-gray-200">
          <h2 className="text-ld font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => notificationRedict()}
              className="px-3 py-1 cursor-pointer bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              View all
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-2 p-4">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 px-4 py-3 text-sm font-medium border-1 cursor-pointer rounded-sm ${
              activeTab === "notifications"
                ? "border-purple-600 text-purple-600 "
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Notifications
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              122
            </span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-1 ${
              activeTab === "activity"
                ? "border-purple-600 text-purple-600 "
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Activity log
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              1
            </span>
          </button>
        </div>

        {/* Content - Remove max-height restriction to fill available space */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-200px)]">
          {activeTab === "notifications" && (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b-1 border-gray-200 rounded-lg"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-green-600 font-medium">
                        New
                      </span>
                      <span className="text-xs text-gray-500">
                        {notification.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {notification.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "activity" && (
            <div className="p-4 text-center text-gray-500">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LeftMenuBar = () => {
  const [showFullDisplay, setShowFullDisplay] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [salesExpanded, setSalesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications"); // Add this line

  const { currentUser } = useSelector((state) => state.currentUser);
  const name = currentUser?.first_name?.slice(0, 2).toUpperCase();
  const userName = currentUser?.first_name;

  // Updated sales sub items to match your requirements with counts
  const salesSubItems = [
    { name: "Pending", route: "sales/pending", key: "sales-pending", count: 0 },
    { name: "Awaiting Delivery", route: "sales/awaiting-delivery", key: "sales-awaiting-delivery", count: 0 },
    { name: "Delivered", route: "sales/delivered", key: "sales-delivered", count: 0 },
    { name: "Completed", route: "sales/completed", key: "sales-completed", count: 19 },
    { name: "Cancelled", route: "sales/cancelled", key: "sales-cancelled", count: 2 },
    { name: "Replaced", route: "sales/replaced", key: "sales-replaced", count: 0 },
  ];

  const leftPaneValues = [
    {
      image: showFullDisplay ? "" : arrowRight,
      icon: <LeftArrowIcon className="size-4 stroke-white" />, // Use fallback icon
      name: "Minimise",
    },
    {
      text: userName,
      name: userName,
      key: "name",
      route: "settings/myAccount",
    },
    { text: name, name: name, key: "userName", route: "settings/myAccount" },
    {
      image: category,
      name: "Dashboard",
      route: "dashboard",
      key: "dashboard",
    },
    {
      icon: <Bell className="size-6 w-[23px] text-white" />,
      name: "Notifications",
      key: "notifications",
      isNotification: true,
      badge: 122,
    },
    {
      image: addSquare,
      name: "Add Listings",
      key: "add-listings",
      route: "add-listings",
    },
    {
      image: listing,
      name: "Bulk Listings",
      key: "my-listings",
      route: "my-listings",
    },
    {
      image: shopping,
      name: "Sales",
      key: "sales",
      hasSubItems: true,
      subItems: salesSubItems,
    },
    {
      image: diagram,
      name: "Reports",
      key: "reports",
      route: "reports",
    },
    
    {
      image: Bulkticket,
      name: "TX Trade",
      key: "tx-trade",
      route: "trade/home",
    },
  ];

  const router = useRouter();
  const isMobile = useIsMobile();
  const [active, setActive] = useState(router?.pathname?.replace("/", ""));

  // Helper function to determine if a sales sub-item should be active
  const getSalesActiveState = () => {
    const currentPath = router?.pathname;
    if (currentPath.startsWith('/sales/')) {
      const salesPage = currentPath.replace('/sales/', '');
      return `sales-${salesPage}`;
    }
    return null;
  };

  // Update active state when route changes for sales pages
  useEffect(() => {
    const currentPath = router?.pathname?.replace("/", "");
    if (currentPath.startsWith('sales/')) {
      const salesActiveKey = getSalesActiveState();
      if (salesActiveKey) {
        setActive(salesActiveKey);
        setSalesExpanded(true); // Auto-expand sales menu if on a sales page
      }
    } else {
      setActive(currentPath);
    }
  }, [router?.pathname]);

  const handleSelectedClick = (index, item) => {
    if (index === 0 && !isMobile) {
      setShowFullDisplay(!showFullDisplay);
      return;
    }

    if (item?.isNotification) {
      setNotificationsOpen(true);
      return;
    }

    if (item?.hasSubItems) {
      setSalesExpanded(!salesExpanded);
      return;
    }

    setActive(item?.key);

    if (isMobile) {
      setMobileMenuOpen(false);
    }
    if (item?.route) {
      router.push(`/${item?.route}`);
    }
  };

  const handleSubItemClick = (subItem) => {
    setActive(subItem?.key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
    if (subItem?.route) {
      router.push(`/${subItem?.route}`);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    setCookie("auth_token", "", -1);
    setCookie("auth_token_validity", "", -1);
    setCookie("user_token", "", -1);
    router.push("/login");
  };

  // Static notification data for mobile
  const notifications = [
    {
      id: 1,
      type: "new",
      date: "10 Jun",
      title: "There is a new open order for 2 ticket(s) for Chris Brown",
      subtitle:
        "Cardiff on 19-06-2025 at 16:00. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 2,
      type: "new",
      date: "09 Jun",
      title:
        "There is a new open order for 1 ticket(s) for Billie Eilish Paris",
      subtitle:
        "on 10-06-2025 at 20:30. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 3,
      type: "new",
      date: "26 May",
      title: "There is a new open order for 2 ticket(s) for Tate McRae",
      subtitle:
        "London on 24-06-2025 at 19:30. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 4,
      type: "new",
      date: "23 May",
      title: "There is a new open order for 3 ticket(s) for Billie Eilish",
      subtitle:
        "London on 14-07-2025 at 20:00. See dashboard if you want to submit an offer.",
      isNew: true,
    },
    {
      id: 5,
      type: "new",
      date: "23 May",
      title: "There is a new open order for 2 ticket(s) for Billie Eilish",
      subtitle:
        "London on 14-07-2025 at 20:00. See dashboard if you want to submit an offer.",
      isNew: true,
    },
  ];

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#343432] h-16 flex items-center justify-between px-4 z-20">
          <Image src={logo} alt="logo" width={60} height={32} />
          <button onClick={toggleMobileMenu} className="p-2 text-white">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Slide-in Menu */}
        <div
          className={`fixed top-0 right-0 h-full bg-[#343432] w-64 transform z-[9999] transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#51428E]">
            <Image src={logo} alt="logo" width={32} height={32} />
            <button onClick={toggleMobileMenu} className="p-2 text-white">
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="flex flex-col p-4 gap-4">
            {leftPaneValues
              .filter((_, index) => index !== 0)
              .map((item, idx) => {
                const index = idx + 1;
                return (
                  <div key={index}>
                    <div
                      onClick={() => handleSelectedClick(index, item)}
                      className={`cursor-pointer flex gap-3 items-center p-3 transition-colors duration-200 ${
                        item?.key === active || (item?.key === 'sales' && active?.startsWith('sales-'))
                          ? "bg-[#64EAA5] rounded-md"
                          : "hover:bg-[#5f6365] rounded-md"
                      }`}
                    >
                      {item?.image && (
                        <Image
                          src={item?.image}
                          alt="icon"
                          width={24}
                          height={24}
                        />
                      )}
                      {item?.icon && item?.icon}
                      {item?.text && (
                        <p className="text-[18px] font-medium text-[#FFFFFF]">
                          {item?.text}
                        </p>
                      )}
                      <div className="text-white capitalize text-[14px] flex-1">
                        {item?.name}
                      </div>
                      {item?.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item?.badge}
                        </span>
                      )}
                      {item?.hasSubItems && (
                        <ChevronRight 
                          className={`size-4 text-white transition-transform duration-200 ${
                            salesExpanded ? 'rotate-90' : ''
                          }`} 
                        />
                      )}
                    </div>

                    {/* Sub items for mobile */}
                    {item?.hasSubItems && salesExpanded && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item?.subItems?.map((subItem, subIndex) => (
                          <div
                            key={subItem.key}
                            onClick={() => handleSubItemClick(subItem)}
                            className={`cursor-pointer flex items-center justify-between p-2 text-sm transition-colors duration-200 relative ${
                              subItem?.key === active
                                ? "bg-[#64EAA5] rounded-md text-black"
                                : "text-gray-300 hover:bg-[#5f6365] rounded-md"
                            }`}
                          >
                            {/* Left border line */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                            
                            {/* Horizontal connecting line */}
                            <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-400 -translate-y-1/2"></div>
                            
                            {/* Vertical connecting lines between items */}
                            {subIndex < item?.subItems?.length - 1 && (
                              <div className="absolute left-0 top-1/2 bottom-0 w-0.5 bg-gray-400"></div>
                            )}
                            
                            <div className="flex items-center gap-2 ml-4">
                              <span>{subItem.name}</span>
                            </div>
                            
                            {subItem.count !== undefined && (
                              <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                                {subItem.count}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="absolute bottom-0 w-full p-4 border-t border-[#51428E]">
            <div
              onClick={handleLogout}
              className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#5f6365] rounded-md"
            >
              <Image src={logout} alt="logout" width={24} height={24} />
              <span className="text-white text-[14px]">Logout</span>
            </div>
          </div>
        </div>

        {/* Notifications Popup for Mobile */}
        <div className={`${notificationsOpen ? "block" : "hidden"}`}>
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setNotificationsOpen(false)}
            />

            {/* Popup positioned from left */}
            <div className="absolute top-20 left-4 right-4 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden z-10">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                    View all
                  </button>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === "notifications"
                      ? "border-purple-600 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Notifications
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    122
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === "activity"
                      ? "border-purple-600 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Activity log
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    1
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {activeTab === "notifications" && (
                  <div className="p-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-green-600 font-medium">
                              New
                            </span>
                            <span className="text-xs text-gray-500">
                              {notification.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium mb-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {notification.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="p-4 text-center text-gray-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay when menu is open */}
        {(mobileMenuOpen || notificationsOpen) && (
          <div
            className="fixed inset-0 bg-gray-200 bg-opacity-50 z-10"
            onClick={() => {
              setMobileMenuOpen(false);
              setNotificationsOpen(false);
            }}
          />
        )}

        <div className="pt-16 pb-16"></div>
      </>
    );
  }

  // Desktop view
  return (
    <>
      <div
        className={`bg-[#343432] z-[99] flex flex-col justify-between transition-all duration-300 ${
          showFullDisplay ? "w-[200px]" : "w-[60px]"
        } h-[100vh] relative`}
      >
        <div>
          <div className="h-[80px] px-[10px] py-[20px] border-b-[1px] border-[#51428E] flex items-center justify-center">
            <Image src={logo} alt="logo" width={40} height={40} />
          </div>
          <div className="flex flex-col p-[10px] gap-3">
            {leftPaneValues.map((item, index) => (
              <div key={index}>
                <div
                  onClick={() => handleSelectedClick(index, item)}
                  className={`cursor-pointer flex gap-3 items-center p-[6px] transition-colors duration-200 relative ${
                    item?.key === active || (item?.key === 'sales' && active?.startsWith('sales-'))
                      ? "bg-[#64EAA5] rounded-md"
                      : "hover:bg-[#5f6365] rounded-md"
                  }`}
                >
                  {item?.image && (
                    <Image
                      src={item?.image}
                      alt="logo"
                      width={24}
                      height={24}
                    />
                  )}
                  {item?.icon && item?.icon}
                  {item?.text && (
                    <p className="text-[18px] font-medium text-[#FFFFFF]">
                      {item?.text}
                    </p>
                  )}
                  {item?.name && showFullDisplay && (
                    <div
                      className={`text-white capitalize text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 ${
                        showFullDisplay
                          ? "max-w-[120px] opacity-100"
                          : "max-w-0 opacity-0"
                      }`}
                    >
                      {item?.name}
                    </div>
                  )}
                  {item?.badge && showFullDisplay && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item?.badge}
                    </span>
                  )}
                  {item?.hasSubItems && showFullDisplay && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div
                        className={`w-2 h-2 border-r-2 border-b-2 border-white transition-transform duration-200 ${
                          salesExpanded
                            ? "rotate-45 -translate-y-0.5"
                            : "-rotate-45 translate-y-0.5"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Sub items for desktop */}
                {item?.hasSubItems && salesExpanded && showFullDisplay && (
                  <div className="ml-4 mt-2 space-y-1 relative">
                    {item?.subItems?.map((subItem, subIndex) => (
                      <div
                        key={subItem.key}
                        onClick={() => handleSubItemClick(subItem)}
                        className={`cursor-pointer flex items-center justify-between p-2 text-sm transition-colors duration-200 rounded relative ${
                          subItem?.key === active
                            ? "bg-[#64EAA5] text-black"
                            : "text-gray-300 hover:bg-[#5f6365]"
                        }`}
                      >
                        {/* Left border line */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                        
                        {/* Horizontal connecting line */}
                        <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-400 -translate-y-1/2"></div>
                        
                        {/* Vertical connecting lines between items */}
                        {subIndex < item?.subItems?.length - 1 && (
                          <div className="absolute left-0 top-1/2 bottom-0 w-0.5 bg-gray-400"></div>
                        )}
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span>{subItem.name}</span>
                        </div>
                        
                        {subItem.count !== undefined && (
                          <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                            {subItem.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div onClick={handleLogout} className="p-[10px] cursor-pointer">
          <Image
            src={logout}
            alt="logo"
            width={24}
            height={24}
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
          />
        </div>
      </div>

      {/* Notifications Popup */}
      <NotificationsPopup
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        showFullDisplay={showFullDisplay}
      />
    </>
  );
};

export default LeftMenuBar;