import axios from "axios";
import AJAX, { fetchAuthorizationKey } from ".";
import { API_ROUTES } from "./apiRoutes";

const isClient = typeof window !== "undefined";

const makeRequest = async ({
  url,
  method,
  data = null,
  token,
  formData = null,
  params = null,
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

export const loginUser = async (token, data) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.LOGIN,
      method: "POST",
      data: data,
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in loginUser", error);
    throw error;
  }
};

export const fetchDashboardData = async (token) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.DASHBOARD,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchingDashboardData", error);
    throw error;
  }
};

export const fetchProfileDetails = async (token, method, data) => {
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

export const fetchAddressBookDetails = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.FETCH_ADDRESS_BOOK_DETAILS}${id ? `/${id}` : ""}`,
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

export const fetchWalletBalance = async (token) => {
  try {
    const response = await makeRequest({
      url: API_ROUTES.WALLET_BALANCE,
      method: "GET",
      ...(token && { token: token }),
    });
    return response?.data?.success ? response?.data?.data : {};
  } catch (error) {
    console.log("ERROR in fetchWalletBalance", error);
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
    console.log("ERROR in getDepositDetails", error);
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

export const fetchUserDetails = async (
  token,
  id,
  method = "GET",
  data,
  params
) => {
  try {
    const response = await makeRequest({
      url: `${API_ROUTES.FETCH_USER_DETAILS}${id ? `/${id}` : ""}`,
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
    console.log(response, "responseresponseresponse");
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
    console.log("ERROR in getDialingCode", error);
    throw error;
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
    return response?.data?.success ? response?.data?.data : {};
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
    return response?.data?.success ? response?.data?.data : {};
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
    throw error;
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
    throw error;
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
    throw error;
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

export const purchaseTracking = async (token, method = "GET", params) => {
  try {
    const queryParams = {
      lang: "en",
      currency: "GBP",
      page: 1,
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
    console.log("ERROR in FetchTabTotal", error);
    throw error;
  }
};

export const purchaseTicketsBuy = async (token, id, params = {}, data) => {
  const queryParams = {
    lang: "en",
    client_country: "IN",
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
    throw error;
  }
};
