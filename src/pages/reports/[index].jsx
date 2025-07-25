import ReportsPage from "@/components/reportsPage";
import PayoutPage from "@/components/reportsPage/payoutPage";
import SelectListItem from "@/components/tradePage/components/selectListItem";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import { fetchWalletPageDetails } from "@/utils/serverSideRequests";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Reports = (props) => {
  const [activeTab, setActiveTab] = useState(props.profile);
  const router = useRouter();
  const tabFields = [
    {
      name: "Wallet",
      key: "wallet",
      route: "/wallet",
      icon: (
        <IconStore.homeIcon className="text-[#3E2E7E] stroke-[#3E2E7E] size-4" />
      ),
    },
    {
      name: "Payouts",
      key: "payouts",
      route: "/payouts",
      icon: (
        <IconStore.search className="text-[#3E2E7E] stroke-[#3E2E7E] size-4" />
      ),
    },
  ];

  const handleSelectItemClick = (item) => {
    setActiveTab(item?.key);
    router?.push(`/reports/${item?.route}`);
  };
  return (
    <div className="bg-[#ECEDF2] w-full h-full relative">
      <div className={`hidden md:flex gap-[4px] w-[70%] px-[24px] pt-[24px]`}>
        {tabFields?.map((item, index) => {
          const selectedIndex = item?.key === activeTab;
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
      {activeTab == "wallet" ? <ReportsPage {...props} /> : <PayoutPage {...props} />}
    </div>
  );
};

export default Reports;

export async function getServerSideProps(ctx) {
  const { index } = ctx?.query;
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await fetchWalletPageDetails(authToken, index);

  return {
    props: { apiData: response ?? {}, profile: index },
  };
}
