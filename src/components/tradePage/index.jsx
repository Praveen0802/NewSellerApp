import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import SelectListItem from "./components/selectListItem";
import TradeHome from "./tradeFolders/home";
import TrackingPage from "./trackingFolder";
import PurchaseFolder from "./purchaseFolder";
import InventoryFolder from "./inventoryFolder";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import EventSearch from "./components/eventSearch";
import roundedChevron from "../../../public/rounded-chevron.svg";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import chevronDown from "../../../public/white-chevron-right.svg";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import AvailableFunds from "./components/availableFunds";

const TradePage = (props) => {
  const { profile, allCategories, fetchTabCount, fetchWalletBalance } = props;
  const router = useRouter();

  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState(profile);

  const [showEventSearch, setShowEventSearch] = useState(profile == 'home' ? true: false);

  const tabFields = [
    {
      name: "Home",
      key: "home",
      route: "/home",
      icon: (
        <IconStore.homeIcon className="text-[#3E2E7E] stroke-[#3E2E7E] size-4" />
      ),
    },
    {
      name: "Inventory",
      key: "inventory",
      route: "/inventory",
      icon: (
        <IconStore.search className="text-[#3E2E7E] stroke-[#3E2E7E] size-4" />
      ),
    },
    {
      name: "Tracking",
      key: "tracking",
      route: "/tracking",
      icon: (
        <p className="text-white bg-[#343432] text-[10px] px-[6px] py-[2px] rounded-md">
          {fetchTabCount?.trackerCount}
        </p>
      ),
    },
    {
      name: "Purchase",
      key: "purchase",
      route: "/purchase",
      icon: (
        <p className="text-white bg-[#343432] text-[10px] px-[6px] py-[2px] rounded-md">
          {fetchTabCount?.purchaseCount}
        </p>
      ),
    },
  ];

  const handleSelectItemClick = (item) => {
    setSelectedTab(item?.key);
    router?.push(`/trade/${item?.route}`);
  };

  const showEventSearchRoutes = ["home", "inventory"];

  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  const selectedSubComponents = {
    home: <TradeHome {...props} showEventSearch={showEventSearch} />,
    tracking: <TrackingPage {...props} />,
    purchase: <PurchaseFolder {...props} />,
    inventory: <InventoryFolder {...props} />,
  };

  const dispatch = useDispatch();

  // Mobile bottom navigation
  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 z-[999] flex justify-around">
      {tabFields?.map((item, index) => {
        const isSelected = item?.key === selectedTab;
        return (
          <div
            key={index}
            onClick={() => handleSelectItemClick(item)}
            className={`flex flex-col items-center py-3 px-2 ${
              isSelected ? "text-[#3E2E7E]" : "text-gray-500"
            }`}
          >
            <div>{item.icon}</div>
            <span className="text-xs mt-1">{item.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-[#ECEDF2] w-full h-full relative">
      {/* Wallet info - Responsive for both desktop and mobile */}
      <div className="md:absolute top-0 flex gap-2 md:gap-3 items-center bg-white p-2 md:p-4 w-full md:w-auto right-0 z-10">
        <div className="flex-1 md:flex-none max-md:px-4">
          {/* <AvailableFunds fetchWalletBalance={fetchWalletBalance} /> */}
        </div>
        <div
          onClick={handleOpenAddWalletPopup}
          className="flex gap-1 md:gap-2 bg-[#F0F1F5] max-md:px-4 cursor-pointer rounded-md p-1 md:p-[8px] items-center"
        >
          <Image src={roundedChevron} width={16} height={16} alt="logo" />
          <p className="text-[12px] md:text-[14px] font-normal">Deposit</p>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className={`hidden md:flex gap-[4px] w-[70%] px-[24px] pt-[24px]`}>
        {tabFields?.map((item, index) => {
          const selectedIndex = item?.key === selectedTab;
          return (
            <SelectListItem
              key={index}
              item={item}
              selectedIndex={selectedIndex}
              handleSelectItemClick={handleSelectItemClick}
            />
          );
        })}
      </div>

      <div className="relative h-full flex flex-col md:flex-row">
        {/* Event Search Toggle Button */}
        {!showEventSearch && showEventSearchRoutes?.includes(profile) && (
          <div
            onClick={() => setShowEventSearch(!showEventSearch)}
            className={`absolute z-[999] md:top-10 top-20 ${
              showEventSearch
                ? "md:left-[265px] left-[100%]"
                : "md:-left-11 -left-11"
            } cursor-pointer -translate-y-1/2 -rotate-90 transform origin-center transition-all duration-300`}
          >
            <div className="px-3 flex items-center gap-1 py-2  bg-[#64EAA5] rounded-md">
              <p className="text-white text-xs font-medium">Event Search</p>
              <Image
                src={chevronDown}
                width={12}
                height={12}
                alt="logo"
                className="rotate-90"
              />
            </div>
          </div>
        )}
        <div
          className={`transition-all duration-200 h-full
            ${
              showEventSearch
                ? "md:w-[400px] w-full absolute z-[100] md:relative"
                : "w-0 opacity-0 max-md:h-0"
            }`}
        >
          <EventSearch
            onClose={() => setShowEventSearch(false)}
            allCategories={allCategories}
          />
        </div>

        {/* Main Content */}
        <div
          className={`transition-all duration-200 overflow-auto h-[calc(100%-100px)] md:h-[calc(100%-100px)] z-[99] ${
            showEventSearch
              ? "md:w-[calc(100%-400px)] w-full md:ml-[0px] md:relative absolute opacity-0 md:opacity-100"
              : "w-full ml-0"
          }`}
          style={{
            paddingBottom: isMobile ? "60px" : "0",
          }}
        >
          {selectedSubComponents?.[selectedTab]}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="block md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default TradePage;
