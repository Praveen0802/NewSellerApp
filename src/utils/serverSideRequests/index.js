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
  fetchTransactionHistory,
  fetchTransactionHistoryMonthly,
  fetchUserDetails,
  fetchWalletBalance,
  getDialingCode,
  getLinkedCards,
  getPartnerSetting,
  LastMinuteEvents,
  purchaseEvents,
  purchaseFavouratesTracking,
  purchaseHistory,
  purchaseTracking,
  topSellingEvents,
} from "../apiHandler/request";

export const fetchSettingsPageDetails = async (profile, token, ctx) => {
  const validProfiles = ["myAccount", "changepassword"];
  try {
    if (validProfiles?.includes(profile)) {
      const [profileDetails] = await Promise.all([
        fetchProfileDetails(token, "GET"),
      ]);
      // const dialingCode = await getDialingCode();
      return { profileDetails };
      // return { addressDetails, profileDetails, fetchCountries, dialingCode };
    } else if (profile === "addressBook") {
      const [primaryAddress, defaultAddress, profileDetails, fetchCountries] =
        await Promise.all([
          fetchAddressBookDetails(token, "", "GET", "", {
            is_primary_address: 1,
          }),
          fetchAddressBookDetails(token, "", "GET", "", {
            is_primary_address: 0,
          }),
          fetchProfileDetails(token, "GET"),
          fetchCountrieList(token),
        ]);
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
    } else if (profile == "myCustomers") {
      const [userDetails] = await Promise.all([
        fetchUserDetails(token),
        // fetchCountrieList(token),
      ]);
      return { userDetails };
    } else if (profile == "linkedCards") {
      const shopperRefernce = ctx?.req?.cookies?.user_token;

      const linkedCards = await getLinkedCards(token, "", shopperRefernce);

      return { linkedCards, shopperRefernce };
    } else if (profile == "ticketDelivery") {
      const partnerDetails = await getPartnerSetting(token);
      return { partnerDetails };
    }
  } catch {}
};

export const fetchWalletPageDetails = async (token) => {
  try {
    const [walletBalance, depositHistory, transactionHistory, countriesList] =
      await Promise.all([
        fetchWalletBalance(token),
        fetchDepositHistoryMonthly(token),
        fetchTransactionHistoryMonthly(token),
        fetchCountrieList(token),
      ]);
    return {
      ...transactionHistory,
      ...depositHistory,
      ...walletBalance,
      countriesList,
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
      topSellingEvents(token),
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
