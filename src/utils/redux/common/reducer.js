import {
  ADD_WALLET_POPUP,
  CONFIRM_PURCHASE_POPUP,
  FETCH_USER_ROLES,
  GET_KYC_STATUS,
  SHOW_FULL_DISPLAY,
  UPDATE_NOTIFICATION_COUNT,
  USER_ACCESS_ROUTES,
} from "./type";

const initalState = {
  addWalletflag: false,
  confirmPurchasePopupFields: {
    flag: false,
    data: {},
  },
  notificationCountData: {
    notification: 0,
    activity: 0,
    isLoaded: false,
  },
  showFullDisplay: false,
  userRoles: [],
  userAccessableRoutes: [],
  kycStatus: {},
};

const CommonReducers = (state = initalState, action) => {
  switch (action.type) {
    case ADD_WALLET_POPUP:
      return {
        ...state,
        addWalletflag: action?.payload?.flag,
      };

    case SHOW_FULL_DISPLAY:
      return {
        ...state,
        showFullDisplay: action?.payload,
      };
    case CONFIRM_PURCHASE_POPUP:
      return {
        ...state,
        confirmPurchasePopupFields: action?.payload,
      };
    case UPDATE_NOTIFICATION_COUNT:
      return {
        ...state,
        notificationCountData: {
          ...state.notificationCountData,
          ...action.payload,
        },
      };
    case FETCH_USER_ROLES:
      return {
        ...state,
        userRoles: action.payload,
      };
    case USER_ACCESS_ROUTES:
      return {
        ...state,
        userAccessableRoutes: action.payload,
      };
    case GET_KYC_STATUS:
      return {
        ...state,
        kycStatus: action.payload,
      };
    default:
      return state;
  }
};

export default CommonReducers;
