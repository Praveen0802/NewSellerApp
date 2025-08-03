import {
  dashboardActivity,
  dashboardAwaitingDelivery,
  dashboardNotifications,
  dashbordReports,
  fetchAddHistoryFilters,
  fetchAddressBookDetails,
  fetchBankAccountDetails,
  fetchBulkListing,
  fetchBulkListingFilters,
  fetchCountrieList,
  fetchDepositHistoryMonthly,
  FetchHotEvents,
  fetchProfileDetails,
  fetchRecentlyViewedList,
  fetchSalesOverview,
  fetchSalesPageData,
  fetchSettingsTxPay,
  fetchTournamentsList,
  fetchTransactionHistoryMonthly,
  fetchUserDetails,
  fetchVenueList,
  getAuthAddress,
  getAuthPhotoId,
  getLinkedCards,
  getMyListingFilters,
  getMyListingHistory,
  getMyListingOverView,
  getPartnerSetting,
  getReferralCode,
  getReferralHistory,
  getSalesCount,
  getSellerContract,
  LastMinuteEvents,
  lmtOverview,
  LMTpurchaseTracking,
  LMTTradeOrders,
  payOutHistory,
  payOutOrderHistory,
  payOutOverview,
  purchaseEvents,
  purchaseHistory,
  purchaseTracking,
  reportHistory,
  reportsOverview,
  topSellingEvents,
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
    } else if (profile === "sbPay") {
      const txPay = await fetchSettingsTxPay(token);
      return { txPay };
    } else if (profile === "kyc") {
      const [photoId, address, contract] = await Promise.allSettled([
        getAuthPhotoId(token),
        getAuthAddress(token),
        getSellerContract(token),
      ]);
      return {
        photoId: photoId?.status === "fulfilled" ? photoId.value : {},
        address: address?.status === "fulfilled" ? address.value : {},
        contract: contract?.status === "fulfilled" ? contract.value : {},
      };
    } else if (profile === "myRefferal") {
      const referralCode = (await getReferralCode(token)) ?? {};
      const referralHistory = (await getReferralHistory(token)) ?? {};
      return { referralCode, referralHistory };
    }
  } catch (err) {
    console.log("ERROR in fetchSettingsPageDetails", err);
  }
};

export const fetchSalesPageDetails = async (profile, token, ctx) => {
  const [salesPage, tournamentList, salesView] = await Promise.allSettled([
    fetchSalesPageData(token, { order_status: profile }),
    fetchTournamentsList(token),
    getSalesCount(token),
  ]);
  return {
    salesPage: salesPage?.status === "fulfilled" ? salesPage.value : null,
    tournamentList:
      tournamentList?.status === "fulfilled" ? tournamentList.value : null,
    salesCount: salesView?.status === "fulfilled" ? salesView?.value : null,
  };
};

export const getAddlistingPageData = async (token, matchId) => {
  const response = await fetchAddHistoryFilters(token, {
    match_id: matchId,
    listing_type: "single",
  });
  return response;
};

export const getMyListingPageData = async (token) => {
  const results = await Promise.allSettled([
    getMyListingOverView(token),
    getMyListingFilters(token),
    getMyListingHistory(token),
  ]);

  const [overview, filters, listingHistory] = results.map((result) =>
    result.status === "fulfilled" ? result.value : {}
  );
  return {
    overview,
    filters,
    listingHistory,
  };
};

export const fetchWalletPageDetails = async (token, index) => {
  try {
    if (index == "wallet") {
      const results = await Promise.allSettled([
        fetchDepositHistoryMonthly(token),
        fetchTransactionHistoryMonthly(token),
        // lmtOverview(token),
        fetchSettingsTxPay(token),
        fetchCountrieList(token),
      ]);

      // Extract successful results, use empty object as fallback for failed requests
      const [
        depositHistory,
        transactionHistory,
        lmtOverviewData,
        countriesList,
      ] = results.map((result) =>
        result.status === "fulfilled" ? result.value : {}
      );

      return {
        ...transactionHistory,
        ...depositHistory,
        ...lmtOverviewData,
        countriesList,
      };
    } else if (index == "payouts") {
      const results = await Promise.allSettled([
        payOutOverview(token),
        payOutHistory(token),
        payOutOrderHistory(token),
        fetchCountrieList(token),
      ]);
      // Extract successful results, use empty object as fallback for failed requests
      const [payoutOverview, payoutHistory, payoutOrders, countriesList] =
        results.map((result) =>
          result.status === "fulfilled" ? result.value : {}
        );

      return {
        ...payoutOverview,
        payoutHistory: payoutHistory,
        payoutOrders: payoutOrders,
        countriesList,
      };
    }
  } catch (error) {
    console.error("Error in fetchWalletPageDetails:", error);
    return {};
  }
};

export const fetchDashboardPageDetails = async (token) => {
  try {
    const results = await Promise.allSettled([
      fetchSalesOverview(token, { date_format: "last_180days" }),
      dashboardAwaitingDelivery(token, { date_format: "today" }),
      dashboardActivity(token),
      dashboardNotifications(token),
      topSellingEvents(token, { date_format: "last_180days" }),
      // dashbordTrade(token),
      dashbordReports(token),
      LMTpurchaseTracking(token),
      LMTTradeOrders(token),
    ]);

    const [
      salesOverView,
      awaitingDelivery,
      activity,
      notifications,
      topSelling,
      reports,
      purchaseTracking,
      tradeOrders,
    ] = results.map((result) =>
      result.status === "fulfilled" ? result.value : null
    );

    return {
      salesOverView,
      awaitingDelivery,
      activity,
      notifications,
      topSelling,
      reports,
      purchaseTracking,
      tradeOrders,
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

export const fetchBulkListingData = async (token, params) => {
  const [bulkListingData, venueList, tournamentsList] =
    await Promise.allSettled([
      fetchBulkListing(token, params),
      fetchVenueList(token),
      fetchTournamentsList(token),
    ]);
  console.log(bulkListingData, "bulkListingDatabulkListingDatabulkListingData");
  return { bulkListingData, venueList, tournamentsList };
};

export const fetchAddBulkListingData = async (token, matches) => {
  const [getBulkListingFilters] = await Promise.allSettled([
    fetchBulkListingFilters(token, { match_id: matches, listing_type: "bulk" }),
  ]);
  return getBulkListingFilters?.status === "fulfilled"
    ? getBulkListingFilters?.value
    : {};
};
