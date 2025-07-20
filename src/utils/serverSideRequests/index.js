import {
  dashboardActivity,
  dashboardAwaitingDelivery,
  dashboardNotifications,
  dashbordReports,
  dashbordTrade,
  fetchAddressBookDetails,
  FetchAllCategories,
  fetchBankAccountDetails,
  fetchCountrieList,
  fetchDashboardData,
  fetchDepositHistory,
  fetchDepositHistoryMonthly,
  FetchHotEvents,
  fetchOrderHistory,
  fetchProfileDetails,
  fetchRecentlyViewedList,
  fetchSalesOverview,
  fetchSalesPageData,
  fetchTransactionHistory,
  fetchTransactionHistoryMonthly,
  fetchUserDetails,
  fetchLMTOverview,
  getDialingCode,
  getLinkedCards,
  getPartnerSetting,
  LastMinuteEvents,
  purchaseEvents,
  purchaseFavouratesTracking,
  purchaseHistory,
  purchaseTracking,
  reportHistory,
  reportsOverview,
  topSellingEvents,
  fetchBulkListing,
  fetchSettingsTxPay,
  fetchTournamentsList,
} from "../apiHandler/request";

export const fetchSettingsPageDetails = async (profile, token, ctx) => {
  const validProfiles = ["myAccount", "changepassword"];
  console.log(profile, "profileprofile");
  try {
    if (validProfiles?.includes(profile)) {
      const [profileDetails] = await Promise.all([
        fetchProfileDetails(token, "GET"),
      ]);
      // const dialingCode = await getDialingCode();
      return { profileDetails };
      // return { addressDetails, profileDetails, fetchCountries, dialingCode };
    } else if (profile === "addressBook") {
      const results = await Promise.allSettled([
        fetchAddressBookDetails(token, "", "GET", "", { primary_address: 1 }),
        fetchAddressBookDetails(token, "", "GET", ""),
        fetchProfileDetails(token, "GET"),
        fetchCountrieList(token),
      ]);

      const [primaryAddress, defaultAddress, profileDetails, fetchCountries] =
        results.map((result) =>
          result.status === "fulfilled" ? result.value : null
        );
      return { primaryAddress, defaultAddress, profileDetails, fetchCountries };
    } else if (profile === "bankAccounts") {
      const [bankDetails, fetchCountries] = await Promise.all([
        fetchBankAccountDetails(token),
        fetchCountrieList(token),
      ]);
      return {
        bankDetails,
        fetchCountries,
      };
    } else if (profile == "myTeam") {
      const [userDetails, fetchCountries] = await Promise.all([
        fetchUserDetails(token),
        fetchCountrieList(token),
      ]);
      return { userDetails, fetchCountries };
    } else if (profile == "linkedCards") {
      const shopperRefernce = ctx?.req?.cookies?.user_token;

      const linkedCards = await getLinkedCards(token, "", shopperRefernce);

      return { linkedCards, shopperRefernce };
    } else if (profile == "ticketDelivery") {
      const partnerDetails = await getPartnerSetting(token);
      return { partnerDetails };
    } else if (profile === "txPay") {
      const txPay = await fetchSettingsTxPay(token);
      return { txPay };
    }
  } catch (err) {
    console.log("ERROR in fetchSettingsPageDetails", err);
  }
};

export const fetchSalesPageDetails = async (profile, token, ctx) => {
  const [salesPage, tournamentList] = await Promise.allSettled([
    fetchSalesPageData(token, { order_status: profile }),
    fetchTournamentsList(token),
  ]);
  return {
    salesPage: salesPage?.status === "fulfilled" ? salesPage.value : null,
    tournamentList:
      tournamentList?.status === "fulfilled" ? tournamentList.value : null,
  };
};

export const fetchWalletPageDetails = async (token) => {
  try {
    const [transactionHistory] = await Promise.all([
      // fetchLMTOverview(token),
      // fetchDepositHistoryMonthly(token),
      fetchTransactionHistoryMonthly(token),
    ]);
    return {
      ...transactionHistory,
      // ...depositHistory,
      // ...walletBalance,
    };
  } catch {}
};

export const fetchDashboardPageDetails = async (token) => {
  try {
    const [
      salesOverView,
      awaitingDelivery,
      activity,
      notifications,
      topSelling,
      reports,
    ] = await Promise.all([
      fetchSalesOverview(token, { date_format: "last_180days" }),
      dashboardAwaitingDelivery(token, { date_format: "today" }),
      dashboardActivity(token),
      dashboardNotifications(token),
      topSellingEvents(token, { date_format: "last_60days" }),
      // dashbordTrade(token),
      dashbordReports(token),
    ]);
    return {
      salesOverView,
      awaitingDelivery,
      activity,
      notifications,
      topSelling,
      reports,
    };
  } catch {
    return [];
  }
};

export const fetchTradePageData = async (tradeType, token, matchId) => {
  if (tradeType === "home") {
    const [hotEvents, lastMinuteEvents, recentlyViewedEvents] =
      await Promise.allSettled([
        FetchHotEvents(token),
        LastMinuteEvents(token),
        fetchRecentlyViewedList(token),
      ]);
    return { hotEvents, lastMinuteEvents, recentlyViewedEvents };
  } else if (tradeType === "inventory") {
    const tradePageData = await purchaseEvents(token, matchId);
    return tradePageData;
  } else if (tradeType === "tracking") {
    const trackingData = await purchaseTracking(token);
    return trackingData;
  } else if (tradeType === "purchase") {
    const purchaseData = await purchaseHistory(token);
    return purchaseData;
  }
  try {
  } catch {
    return {};
  }
};

export const reportHistoryData = async (token) => {
  const [reportsOverviewData, reportHistoryData] = await Promise.allSettled([
    reportsOverview(token),
    reportHistory(token),
  ]);
  return { reportsOverviewData, reportHistoryData };
};

export const fetchBulkListingData = async (token) => {
  const [bulkListingData] = await Promise.allSettled([fetchBulkListing(token)]);
  return bulkListingData;
};
