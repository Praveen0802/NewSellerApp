const ROOT_URL = process.env.API_BASE_URL;

export const API_ROUTES = {
  REPORTS_OVERVIEW: `/reports/overview`,
  GET_TEAM_MEMBERS:`/settings/my-teams`,
  DELETE_TEAM_MEMBERS:`/settings/delete-my-team`,
  ADD_TEAM_MEMBERS:`/settings/add-my-team`,
  UPDATE_TEAM_MEMBERS:`/settings/update-my-team`,
  SALES_ORDER_DETAILS: `/sales/order-details`,
  REPORTS_ORDER_DETAILS: `/reports/order-details`,
  REPORTS_ORDER_LOG: `/reports/order-logs`,
  REPORTS_INVENTORY_LOGS: `/reports/inventory-logs`,
  SALES_ORDER_LOG: `/sales/order-logs`,
  SALES_INVENTORY_LOG: `/sales/inventory-logs`,
  FETCH_BULK_LISTING: `/events/search-events`,
  TOURNAMENTS_LIST: `/events/tournament-list`,
  REPORTS_EVENT_SEARCH: `/reports/events-search`,
  REPORT_HISTORY: `/reports/history`,
  LOGIN: `/auth/login`,
  REGISTER_USER: "/auth/register",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION_REQUEST: "/auth/resend-verify-email",
  SALES_PAGE: `/sales/overview`,
  SALES_OVERVIEW: `/dashboard/sales-overview`,
  AWAITING_DELIVERY: `/dashboard/awaiting-delivery`,
  DASHBOARD_NOTIFICATIONS: `/dashboard/notifications`,
  TOP_SELLING_EVENTS: `/dashboard/top-selling-events`,
  DASHBOARD_LMT_TRADE: `/dashboard/lmt-trade`,
  DASHBOARD_REPORTS: `/dashboard/reports/GBP`,
  DASHBOARD_ACTIVITY: `/dashboard/activity`,
  PROFILE_DETAILS: `/settings/my-account`,
  UPDATE_PROFILE_DETAILS: `/settings/update-my-account`,
  EXPORT_REPORTS: `/reports/export`,
  EXPORT_SALES: `/sales/export-reports`,
  GET_ORDER_HISTORY: `/wallet/get-order-history`,
  SEND_RESET_REQUEST: `/auth/password/reset-request`,
  FETCH_ADDRESS_BOOK_DETAILS: `/settings/get-address-book`,
  UPDATE_ADDRESS_BOOK_DETAILS: `/settings/update-address-book`,
  SAVE_ADDRESS_BOOK_DETAILS: `/settings/add-address-book`,
  FETCH_BANK_ACCOUNTS: `/settings/bank-accounts`,
  CHANGE_PASSWORD: `/auth/change-password`,
  LMT_OVERVIEW: `/lmt-pay/overview`,
  DEPOSIT_HISTORY: `/wallet/get-deposit-history`,
  TRANSACTION_HISTORY: `/wallet/get-transaction-history`,
  MONTHLY_TRANSACTION_HISTORY: `/lmt-pay/get-transaction-history`,
  MONTHLY_DEPOSIT_HISTORY: `/lmt-pay/get-deposit-history`,
  GET_DEPOSIT_DETAILS: `/wallet/get-deposit-details`,
  GET_TRANSACTION_DETAILS: `/wallet/get-transaction-details`,
  SEND_DEPOSIT_REQUEST: `/wallet/deposit`,
  REFRESH_AUTH_TOKEN: `/auth/refresh-token`,
  FETCH_COUNTRIES: `/countries`,
  FETCH_CITIES: `/cities`,
  RESET_PASSWORD: `/settings/reset-password`,
  GET_PAYMENT_CONFIG: "/get-payment-config",
  STORE_PAYMENT_METHOD: "/store-payment-method",
  GET_LINKED_CARDS: "/get-linked-cards",
  GET_CURRENCY: "/settings/currency",
  GET_DIALING_CODE: "/settings/dialing-code",
  REMOVE_SAVED_CARD: "/remove-saved-card",
  ACCOUNT_REFERENCE: "/wallet/account-reference",
  HOT_EVENTS: "/purchase/events/hot",
  LAST_MINUTE_EVENTS: "/purchase/events/last-minute",
  FETCH_EVENT_SEARCH: "/purchase/events/search",
  FETCH_VENUE: `/settings/stadium`,
  FETCH_ALL_CATEGORIES: "/settings/allcategories",
  FETCH_TAB_TOTAL: "/purchase/tab-total",
  RECENTLY_VIEWED_EVENTS: `/purchase/events/recently-viewed`,
  PURCHASE_EVENTS: "/purchase/events",
  PURCHASE_TRACKING: "/purchase/tracking",
  PURCHASE_TRACKING_SEARCH: "/purchase/tracking-search",
  PURCHASE_TICKETS: "/purchase/tickets",
  PURCHASE_HISTORY: "/purchase/history",
  TICKET_QUANTITY_UPDATE: "/purchase/tickets-quantity-update",
  PURCHASE_PAYMENT_METHODS: "/purchase/payment-methods",
  PURCHASE_TICKETS_VALIDATE: "/purchase/tickets/validate",
  PURCHASE_TICKETS_BUY: "/purchase/tickets/buy",
  DELETE_ADDRESS_BOOK: "/settings/delete-address-book",
  ADYEN_CREATE_SESSION: "/adyen/createsession",
  ADYEN_PAYMENT_UPDATE: "/adyen/paymentUpdate",
  ADYEN_PAYMENT_SUBMIT: "/adyen/paymentResponse",
  PURCHASE_TICKET_CONFIRMATON: "/purchase/tickets/confirmation",
  PAY_WITH_SAVED_CARDS: "/adyen/pay-with-saved-card",
  PURCHASE_ATTENDEE_DETAILS: "/purchase/atendee-update-bulk",
  GET_CONTACT_DETAILS: "/settings/get-contact-details",
  GET_WALLET_BALANCE: "/wallet/get-wallet-balance",
  GET_PARTNER_SETTINGS: "/settings/get-partner-setting",
  POST_PARTNER_SETTINGS: "/settings/partner-setting",
  UPDATE_NOMINEE: "/update_applynominee",
  REQUEST_FEATURE: "/settings/request-feature",
  NOTIFICATION_HISTORY: "/notification/notification-history",
  NOTIFICATION_ACTIVITY_HISTORY: "/notification/activity-history",
  NOTIFICATION_UPDATE: "/notification/update-notification",
  GET_NOTIFICATION_COUNT: "/ui-settings/menu-notification",
  GET_TX_PAY: "/settings/lmt-pay",
};
