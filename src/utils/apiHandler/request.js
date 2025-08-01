import axios from "axios";
import AJAX, { fetchAuthorizationKey } from ".";
import { API_ROUTES } from "./apiRoutes";
import { allCountryCodes } from "../constants/allContryCodes";
import { inventoryLog, orderDetails, orderLog } from "@/data/testOrderDetails";

const isClient = typeof window !== "undefined";

const makeRequest = async ({
  url,
  method,
  data = null,
  token,
  formData = null,
  params = null,
  headers = {},
}) => {
  const ROOT_URL = process.env.API_BASE_URL;
  let modifiedUrl = isClient ? url : `${ROOT_URL}${url}`;
  // Appending params if available
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      modifiedUrl.includes("?")
        ? (modifiedUrl += `&${key}=${value}`)
        : (modifiedUrl += `?${key}=${value}`);
    });
  }
  // Making API call based on client or server
  try {
    const response = isClient
      ? (await method.toLowerCase()) === "get"
        ? AJAX.get(modifiedUrl, { ...(token && { token: token }) })
        : AJAX.post(
            url,
            data,
            formData,
            { ...(token && { token: token }) },
            method
          )
      : await axios({
          url: modifiedUrl,
          method,
          headers: {
            ...fetchAuthorizationKey(token),
            domainkey: process.env.DOMAIN_KEY,
          },
          ...(data && { data: data }),
        });
    return response;
  } catch (error) {
    console.error(`${error?.response?.status} error in API: ${url}`, error);
    throw error;
  }
};

export const reportsOverview = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REPORTS_OVERVIEW,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchHotEvent", error);
    return {};
  }
};

export const fetchBulkListing = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_BULK_LISTING,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchBulkListing", error);
    return {};
  }
};

export const myListingUploadTickets = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.MY_LISTING_UPLOAD_TICKETS}`,
      method: "POST",
      ...(token && { token: token }),
      ...(data && { formData: data }),
    });
    return response?.data ? response?.data : {};
  } catch (error) {
    console.log("ERROR in myListingUploadTickets", error);
  }
};

export const fetchVenueList = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.VENUE_LIST,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchVenueList", error);
    return {};
  }
};

export const fetchBulkListingFilters = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_BULK_LISTING_FILTERS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchBulkListing", error);
    return {};
  }
};

export const fetchBlockDetails = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_BLOCKS_BY_CATEGORY,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchBulkListing", error);
    return {};
  }
};

export const reportHistory = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REPORT_HISTORY,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in reportHistory", error);
    return {};
  }
};

export const reportEventSearch = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REPORTS_EVENT_SEARCH,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in reportEventSearch", error);
    return {};
  }
};

export const downloadReports = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.EXPORT_REPORTS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in reportEventSearch", error);
    return {};
  }
};

export const deleteMyListing = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DELETE_TICKET,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in reportEventSearch", error);
    return {};
  }
};

export const downloadSalesCSVReport = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.EXPORT_SALES,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in reportEventSearch", error);
    return {};
  }
};

export const loginUser = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.LOGIN,
      method: "POST",
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    return error?.response?.data;
    console.log("ERROR in loginUser", error);
    throw error;
  }
};

export const fetchSalesOverview = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SALES_OVERVIEW,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchingDashboardData", error);
    throw error;
  }
};

export const fetchProfileDetails = async (token, method, data) => {
  console.log(token, method, data, "oooooooooooooo");
  try {
    const response = await makeRequest({
      url: API_ROUTES.PROFILE_DETAILS,
      method: method ?? "GET",
      ...(token && { token: token }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchingProfileDetails", error);
    throw error;
  }
};

export const updateProfileDetails = async (token, method, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.UPDATE_PROFILE_DETAILS,
      method: method ?? "PUT",
      ...(token && { token: token }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in updatingProfileDetails", error);
    throw error;
  }
};

export const fetchAddressBookDetails = async (
  token,
  method = "GET",
  data,
  params
) => {
  try {
    const id = "";
    const apiUrl = `${API_ROUTES.FETCH_ADDRESS_BOOK_DETAILS}${
      id ? `/${id}` : ""
    }`;

    const response = await makeRequest({
      url: apiUrl,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchingAddressBookDetails", error);
    throw error;
  }
};

export const saveAddressBookDetails = async (
  token,
  id = "",
  method = "GET",
  data,
  params
) => {
  try {
    const selectedApi =
      method?.toLowerCase() === "post"
        ? API_ROUTES.SAVE_ADDRESS_BOOK_DETAILS
        : API_ROUTES.UPDATE_ADDRESS_BOOK_DETAILS;
    const apiUrl = `${selectedApi}${id ? `/${id}` : ""}`;

    const response = await makeRequest({
      url: apiUrl,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchingAddressBookDetails", error);
    throw error;
  }
};

export const changePasswordRequest = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.CHANGE_PASSWORD,
      method: "POST",
      data: data,
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in changePasswordRequest", error);
    throw error;
  }
};

export const fetchLMTOverview = async (token) => {
  try {
    console.log(API_ROUTES.LMT_OVERVIEW, "API_ROUTES.LMT_OVERVIEW");
    const response = await makeRequest({
      url: API_ROUTES.LMT_OVERVIEW,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchLMTOverview", error);
    throw error;
  }
};

export const fetchDepositHistory = async (token) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DEPOSIT_HISTORY,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistory", error);
    throw error;
  }
};

export const fetchTransactionHistory = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.TRANSACTION_HISTORY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchTransactionHistory", error);
    throw error;
  }
};

export const fetchBankAccountDetails = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.FETCH_BANK_ACCOUNTS}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchBankAccountDetails", error);
    throw error;
  }
};

export const updateBankAccount = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.UPDATE_BANK_ACCOUNT}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchBankAccountDetails", error);
    throw error;
  }
};

export const payOutOverview = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.PAYOUT_OVERVIEW,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchOrderHistory", error);
    throw error;
  }
};

export const payOutHistory = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.PAYOUT_HISTORY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchOrderHistory", error);
    throw error;
  }
};

export const payOutOrderHistory = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.PAYOUT_HISTORY_DETAILS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchOrderHistory", error);
    throw error;
  }
};

export const sendResetRequest = async (data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SEND_RESET_REQUEST,
      method: "POST",
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in sendResetRequest", error);
    throw error;
  }
};

export const dashboardAwaitingDelivery = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.AWAITING_DELIVERY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchOrderHistory", error);
    throw error;
  }
};

export const dashboardActivity = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DASHBOARD_ACTIVITY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in dashboardActivity", error);
    throw error;
  }
};

export const dashboardNotifications = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DASHBOARD_NOTIFICATIONS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in DASHBOARD_NOTIFICATIONS", error);
    throw error;
  }
};

export const topSellingEvents = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.TOP_SELLING_EVENTS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in TOP_SELLING_EVENTS", error);
    throw error;
  }
};

export const LMTpurchaseTracking = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.LMT_TRADE_TRACKING,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in LMTpurchaseTracking", error);
    throw error;
  }
};

export const LMTTradeOrders = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.LMT_TRADE_ORDERS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in LMTTradeOrders", error);
    throw error;
  }
};

export const dashbordTrade = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DASHBOARD_LMT_TRADE,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in DASHBOARD_LMT_TRADE", error);
    throw error;
  }
};

export const dashbordReports = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DASHBOARD_REPORTS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in DASHBOARD_REPORTS", error);
    throw error;
  }
};

export const fetchOrderHistory = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_ORDER_HISTORY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchOrderHistory", error);
    throw error;
  }
};

export const fetchTransactionHistoryMonthly = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.MONTHLY_TRANSACTION_HISTORY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchTransactionHistoryMonthly", error);
    throw error;
  }
};

export const fetchDepositHistoryMonthly = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.MONTHLY_DEPOSIT_HISTORY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const getMyListingOverView = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_MY_LISTING_OVERVIEW,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const getMyListingFilters = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_MY_LISTING_TICKET_FILTERS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const updateMyListing = async (token, id, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.UPDATE_MY_LISTING_TICKETS}${id ? `/${id}` : ""}`,
      method: "PUT",
      ...(data && { data: data }),
      ...(token && { token: token }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const getMyListingHistory = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_MY_LISTING_TICKET_HISTORY,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const getViewDetailsPopup = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.VIEW_DETAILS_POPUP,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const fetchAddHistoryFilters = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_ADD_LISTING_FILTERS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchAddHistoryFilters", error);
    throw error;
  }
};

export const lmtOverview = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.LMT_PAY_OVERVIEW,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchDepositHistoryMonthly", error);
    throw error;
  }
};

export const getDepositDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_DEPOSIT_DETAILS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getDepositDetails", error);
    throw error;
  }
};

export const getTransactionDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_TRANSACTION_DETAILS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getTransactionDetails", error);
    throw error;
  }
};

export const sendDepositRequest = async (data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SEND_DEPOSIT_REQUEST,
      method: "POST",
      formData: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in sendDepositRequest", error);
    throw error;
  }
};

export const refreshAuthToken = async (token) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REFRESH_AUTH_TOKEN,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getDepositDetails", error);
    return { error: true };
  }
};

export const fetchCountrieList = async (token) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_COUNTRIES,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchCountrieList", error);
    throw error;
  }
};

export const fetchCityBasedonCountry = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_CITIES,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getDepositDetails", error);
    throw error;
  }
};

export const getAllPermissions = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_ALL_PERMISSIONS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getDepositDetails", error);
    throw error;
  }
};

export const fetchUserDetails = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_TEAM_MEMBERS}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const editUserDetails = async (token, method = "GET", params) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.EDIT_USER_ID}`,
      method: method,
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const saveAddListing = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.SAVE_ADD_LISTING}`,
      method: "POST",
      ...(token && { token: token }),
      ...(data && { formData: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const saveBulkListing = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.SAVE_BULK_LISTING}`,
      method: "POST",
      ...(token && { token: token }),
      ...(data && { formData: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const updateTicketsPrice = async (token, data, params) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.UPDATE_TICKETS_PRICE}`,
      method: "POST",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in updateTicketsPrice", error);
    throw error;
  }
};

export const getmarketingInsights = async (token, params) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.MARKETING_INSIGHTS}`,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in updateTicketsPrice", error);
  }
};

export const DeleteUserDetails = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.DELETE_TEAM_MEMBERS}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const addTeamMembers = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ADD_TEAM_MEMBERS}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const updateTeamMembers = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.UPDATE_TEAM_MEMBERS}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchUserDetails", error);
    throw error;
  }
};

export const resetPassword = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.RESET_PASSWORD,
      method: "POST",
      data: data,
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in sendResetRequest", error);
    throw error;
  }
};

export const getPaymentDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_PAYMENT_CONFIG,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in getPaymentDetails", error);
    throw error;
  }
};

export const storePaymentMethod = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.STORE_PAYMENT_METHOD,
      method: "POST",
      data: data,
      ...(token && { token: token }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in storePaymentMethod", error);
    throw error;
  }
};

export const getLinkedCards = async (token, params, id) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_LINKED_CARDS}${id ? `/${id}` : ""}`,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in getLinkedCards", error);
    throw error;
  }
};

export const getCurrencyDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_CURRENCY}`,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in getCurrencyDetails", error);
    throw error;
  }
};

export const getDialingCode = async (token, params) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_DIALING_CODE}`,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    return { data: allCountryCodes?.data };
    // console.log("ERROR in getDialingCode", error);
    // return error;
  }
};

export const removeLinkedCard = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.REMOVE_SAVED_CARD}`,
      method: "POST",
      data: data,
      ...(token && { token: token }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in removeLinkedCard", error);
    throw error;
  }
};

export const accountReference = async (token, params) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ACCOUNT_REFERENCE}`,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in accountReference", error);
    throw error;
  }
};

export const RegisterUser = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REGISTER_USER,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    console.log(response, "responseresponse");
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in RegisterUser", error?.response, error);
    return error?.response?.data;
    // throw error;
  }
};

export const VerifyEmail = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.VERIFY_EMAIL,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in VerifyEmail", error);
    throw error;
  }
};

export const ResendVerificationRequest = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.RESEND_VERIFICATION_REQUEST,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in ResendVerificationRequest", error);
    throw error;
  }
};

export const fetchSalesPageData = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SALES_PAGE,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchSalesPageData", error);
    throw error;
  }
};

export const getTeamMembers = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_TEAM_MEMBERS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getTeamMembers", error);
    throw error;
  }
};

export const fetchSalesOrderDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SALES_ORDER_DETAILS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success
      ? response?.data?.data?.length > 0
        ? response?.data?.data
        : orderDetails
      : orderDetails;
  } catch (error) {
    // console.log("ERROR in fetchSalesPageData", error);
    // throw error;
    return orderDetails;
  }
};

export const fetchSalesOrderLogs = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SALES_ORDER_LOG,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success
      ? response?.data?.data?.length > 0
        ? response?.data?.data
        : orderLog
      : orderLog;
  } catch (error) {
    console.log("ERROR in fetchSalesPageData", error);
    throw error;
  }
};

export const fetchSalesInventoryLogs = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SALES_INVENTORY_LOG,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success
      ? response?.data?.data?.length > 0
        ? response?.data?.data
        : inventoryLog
      : inventoryLog;
  } catch (error) {
    console.log("ERROR in fetchSalesPageData", error);
    throw error;
  }
};

export const fetchReportsOrderDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REPORTS_ORDER_DETAILS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success
      ? response?.data?.data?.length > 0
        ? response?.data?.data
        : orderDetails
      : orderDetails;
  } catch (error) {
    // console.log("ERROR in fetchSalesPageData", error);
    // throw error;
    return orderDetails;
  }
};

export const fetchReportsOrderLogs = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REPORTS_ORDER_LOG,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success
      ? response?.data?.data?.length > 0
        ? response?.data?.data
        : orderLog
      : orderLog;
  } catch (error) {
    return orderLog;
    console.log("ERROR in fetchReportsPageData", error);
    throw error;
  }
};

export const fetchReportsInventoryLogs = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.REPORTS_INVENTORY_LOGS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success
      ? response?.data?.data?.length > 0
        ? response?.data?.data
        : inventoryLog
      : inventoryLog;
  } catch (error) {
    return inventoryLog;
    console.log("ERROR in fetchSalesPageData", error);
    throw error;
  }
};

export const fetchTournamentsList = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.TOURNAMENTS_LIST,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchTournamentsList", error);
    throw error;
  }
};

export const FetchHotEvents = async (token, params = {}) => {
  const queryParams = {
    ...params,
    lang: "en",
    currency: "GBP",
    client_country: "IN",
  };
  try {
    const response = await makeRequest({
      url: API_ROUTES.HOT_EVENTS,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchHotEvent", error);
    return {};
  }
};

export const LastMinuteEvents = async (token, params = {}) => {
  const queryParams = {
    ...params,
    lang: "en",
    currency: "GBP",
    client_country: "IN",
  };
  try {
    const response = await makeRequest({
      url: API_ROUTES.LAST_MINUTE_EVENTS,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in LastMinuteEvents", error);
    return {};
  }
};

export const FetchEventSearch = async (token, params = {}) => {
  const queryParams = {
    ...params,
    lang: "en",
    currency: "GBP",
  };
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_EVENT_SEARCH,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchEventSearch", error);
    throw error;
  }
};

export const FetchVenue = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_VENUE,
      method: "GET",
      ...(token && { token: token }),
      params: params,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchVenue", error);
    throw error;
  }
};

export const FetchAllCategories = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_ALL_CATEGORIES,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchAllCategories", error);
    throw error;
  }
};

export const FetchTabTotal = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_TAB_TOTAL,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchTabTotal", error);
    throw error;
  }
};

export const fetchRecentlyViewedList = async (
  token,
  method = "GET",
  params,
  data
) => {
  const queryParams = {
    ...params,
    lang: "en",
  };
  try {
    const response = await makeRequest({
      url: API_ROUTES.RECENTLY_VIEWED_EVENTS,
      method: method,
      ...(token && { token: token }),
      ...(method?.toLocaleLowerCase() == "get" && { params: queryParams }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchRecentlyViewedList", error);
    return {};
  }
};

export const purchaseEvents = async (token, id, params = {}) => {
  const queryParams = {
    lang: "en",
    currency: "GBP",
    page: 1,
    ...params,
  };
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_EVENTS}/${id}`,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in FetchTabTotal", error);
    throw error;
  }
};

export const purchaseFavouratesTracking = async (
  token,
  method = "GET",
  data,
  id
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_TRACKING}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseFavouratesTracking", error);
    throw error;
  }
};

export const AddFavouratesTracing = async (token, method = "GET", data, id) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ADD_PURCHASE_TRACKING}${id ? `/${id}` : ""}`,
      method: method,
      ...(token && { token: token }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseFavouratesTracking", error);
    throw error;
  }
};

export const purchaseTracking = async (token, method = "GET", params) => {
  try {
    const queryParams = {
      lang: "en",
      // currency: "GBP",
      // page: 1,
      ...params,
    };
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_TRACKING_SEARCH}`,
      method: method,
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseFavouratesTracking", error);
    throw error;
  }
};

export const purchaseTickets = async (token, id, params = {}) => {
  const queryParams = {
    lang: "en",
    client_country: "IN",
    ...params,
  };
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_TICKETS}/${id}`,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseTickets", error);
    throw error;
  }
};

export const purchaseHistory = async (token, params = {}) => {
  const queryParams = {
    lang: "en",
    ...params,
  };
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_HISTORY}`,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseHistory", error);
    throw error;
  }
};

export const PriceUpdatewithQuantity = async (token, id, params) => {
  try {
    const queryParams = {
      lang: "en",
      client_country: "IN",
      ...params,
    };
    const response = await makeRequest({
      url: `${API_ROUTES.TICKET_QUANTITY_UPDATE}${id ? `/${id}` : ""}`,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseFavouratesTracking", error);
    throw error;
  }
};

export const paymentPurchaseDetails = async (token, params) => {
  try {
    const queryParams = {
      lang: "en",
      client_country: "IN",
      ...params,
    };
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_PAYMENT_METHODS}`,
      method: "GET",
      ...(token && { token: token }),
      params: queryParams,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in paymentPurchaseDetails", error);
    throw error;
  }
};

export const purchaseTicketValidate = async (token, params = {}, data) => {
  const queryParams = {
    lang: "en",
    client_country: "IN",
    ...params,
  };
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_TICKETS_VALIDATE}`,
      method: "POST",
      ...(token && { token: token }),
      params: queryParams,
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseTicketValidate", error);
    return error?.response?.data;
  }
};

export const purchaseTicketsBuy = async (token, id, params = {}, data) => {
  const queryParams = {
    // lang: "en",
    // client_country: "IN",
    ...params,
  };
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_TICKETS_BUY}/${id}`,
      method: "POST",
      ...(token && { token: token }),
      params: queryParams,
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseTicketsBuy", error);
    return error?.response?.data;
  }
};

export const deleteAddressBook = async (token, payload) => {
  try {
    const { id } = payload ?? {};
    const response = await makeRequest({
      url: `${API_ROUTES.DELETE_ADDRESS_BOOK}/${id}`,
      method: "DELETE",
      ...(token && { token: token }),
      // data: payload,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in deleteAddressBook", error);
    throw error;
  }
};

export const adyenCreateSession = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ADYEN_CREATE_SESSION}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in purchaseTicketsBuy", error);
    throw error;
  }
};

export const adyenPaymentUpdate = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ADYEN_PAYMENT_UPDATE}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in adyenPaymentUpdate", error);
    throw error;
  }
};

export const adyenPaymentSubmit = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ADYEN_PAYMENT_SUBMIT}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in adyenPaymentSubmit", error);
    throw error;
  }
};

export const purchaseTicketConfirm = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_TICKET_CONFIRMATON}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseTicketConfirm", error);
    throw error;
  }
};

export const paymentWithExistingCard = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PAY_WITH_SAVED_CARDS}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in paymentWithExistingCard", error);
    return error?.response?.data;
  }
};

export const purchaseAttendeeDetails = async (token, id, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.PURCHASE_ATTENDEE_DETAILS}/${id}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in purchaseAttendeeDetails", error);
    return error?.response?.data;
  }
};

export const getContactDetails = async (token) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_CONTACT_DETAILS}`,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getContactDetails", error);
    return error?.response?.data;
  }
};

export const getWalletBalance = async (token) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_WALLET_BALANCE}`,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getWalletBalance", error);
    return error?.response?.data;
  }
};

export const getPartnerSetting = async (token) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_PARTNER_SETTINGS}`,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getWalletBalance", error);
    return error?.response?.data;
  }
};

export const postPartnerSetting = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.POST_PARTNER_SETTINGS}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getWalletBalance", error);
    return error?.response?.data;
  }
};

export const downloadTicketLinks = async (token, url) => {
  try {
    const response = await makeRequest({
      url: `${url}`,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in getWalletBalance", error);
    return error?.response?.data;
  }
};

export const updateNominee = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.UPDATE_NOMINEE}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getWalletBalance", error);
    return error?.response?.data;
  }
};

export const requestFeature = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.REQUEST_FEATURE}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in getWalletBalance", error);
    return error?.response?.data;
  }
};

export const fetchNotificationHistory = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.NOTIFICATION_HISTORY,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in fetchNotificationHistory", error);
    throw error;
  }
};

export const fetchActivityHistory = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.NOTIFICATION_ACTIVITY_HISTORY}`,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in fetchActivityHistory", error);
    return error?.response?.data;
  }
};

export const updateNotification = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.NOTIFICATION_UPDATE}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in updateNotification", error);
    return error?.response?.data;
  }
};

export const fetchNotificationCount = async (token) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_NOTIFICATION_COUNT}`,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in fetchNotificationCount", error);
    return error?.response?.data;
  }
};

export const fetchSettingsTxPay = async (token) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.GET_TX_PAY}`,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in fetchNotificationCount", error);
    return error?.response?.data;
  }
};

export const zohoEmbed = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ZOHO_EMBED}`,
      method: "POST",
      ...(token && { token: token }),
      data: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in updateNotification", error);
    return error?.response?.data;
  }
};

export const fetchCurrency = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.FETCH_CURRENCY,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchSalesPageData", error);
    throw error;
  }
};

export const getSellerContract = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_AUTH_SELLER_CONTRACT,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in GetSellerContract", error);
    throw error;
  }
};

export const getAuthPhotoId = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_AUTH_PHOTO_ID,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in GetAuthPhotoId", error);
    throw error;
  }
};

export const getAuthAddress = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_AUTH_ADDDRESS,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in GetAuthPhotoId", error);
    throw error;
  }
};

export const saveSellerContract = async (data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SAVE_SELLER_CONTRACT,
      method: "POST",
      formData: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in saveSellerContract", error);
    throw error;
  }
};

export const savePhotoId = async (data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SAVE_PHOTO_ID,
      method: "POST",
      formData: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in savePhotoId", error);
    throw error;
  }
};

export const saveAddressDocument = async (data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.SAVE_ADDRESS_DOCUMENT,
      method: "POST",
      formData: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in saveAddressDocument", error);
    throw error;
  }
};

export const getReferralCode = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_REFERRAL_CODE,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in getReferralCode", error);
    throw error;
  }
};

export const getReferralHistory = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_REFERRAL_HISTORY,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data;
  } catch (error) {
    console.log("ERROR in getReferralHistory", error);
    throw error;
  }
};

export const addSalesPendingNotes = async (token, data) => {
  try {
    const { id } = data ?? {};
    const response = await makeRequest({
      url: `${API_ROUTES.ADD_SALES_PENDING_NOTES}${id ? `/${id}` : ""}`,
      method: "PUT",
      ...(token && { token: token }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in updatingProfileDetails", error);
    throw error;
  }
};

export const addReportsNotes = async (token, data) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.ADD_REPORTS_NOTES}`,
      method: "POST",
      ...(token && { token: token }),
      ...(data && { data: data }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in updatingProfileDetails", error);
    throw error;
  }
};

export const FetchPerformerOrVenueListing = async (token, params = {}) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_EVENT_LISTING,
      method: "GET",
      ...(token && { token: token }),
      ...(params && { params: params }),
    });
    return response?.data?.success ? response?.data : {};
  } catch (error) {
    console.log("ERROR in FetchPerformerOrVenueListing", error);
    return {};
  }
};

export const getLMTPayPrefill = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_LMT_PAY_PREFILL,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getLMTPayPrefill", error);
    throw error;
  }
};

export const getPayoutDetails = async (token, params) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.GET_PAYOUT_DETAILS,
      method: "GET",
      ...(params && { params: params }),
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in getPayoutDetails", error);
    throw error;
  }
};
