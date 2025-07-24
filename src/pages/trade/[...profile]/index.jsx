import TradePage from "@/components/tradePage";
import { FetchAllCategories, FetchTabTotal, getWalletBalance } from "@/utils/apiHandler/request";
import { getAuthToken } from "@/utils/helperFunctions";
import { fetchTradePageData } from "@/utils/serverSideRequests";
import React from "react";

const Trade = (props) => {
  return <TradePage {...props} />;
};

export default Trade;

export async function getServerSideProps(context) {
  const { profile, success = "",booking_no='' } = context?.query;
  const [initialStep, matchId] = profile;
  const authToken = getAuthToken(context);
  const response = await fetchTradePageData(initialStep, authToken, matchId);
  // const allCategories = await FetchAllCategories(authToken);
  const fetchTabCount = await FetchTabTotal(authToken);
  // const fetchWalletBalance = await getWalletBalance(authToken);
  return {
    props: {
      profile: initialStep,
      ...(matchId && { matchId: matchId }),
      response: response || {},
      // allCategories: allCategories || [],
      fetchTabCount: fetchTabCount || {},
      ...(success && { success: success }),
      ...(booking_no && { booking_no: booking_no }),
      // fetchWalletBalance
    },
  };
}
