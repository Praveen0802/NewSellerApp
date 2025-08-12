import {
  ADD_WALLET_POPUP,
  ALLOWED_ROUTES,
  CONFIRM_PURCHASE_POPUP,
  FETCH_USER_ROLES,
  GET_KYC_STATUS,
  LEFT_PANEL_VALUES,
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
  userRoles: null, // Changed from [] to null to indicate not loaded
  userAccessableRoutes: [],
  kycStatus: {},
  leftPanelValues: [],
  allowedRoutes: null, // Changed from [] to null to indicate not loaded
  isPermissionsLoaded: false, // Added explicit loading flag
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
        // Set loading flag to true when user roles are fetched
        isPermissionsLoaded: true,
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
    case LEFT_PANEL_VALUES:
      return {
        ...state,
        leftPanelValues: action.payload,
      };
    case ALLOWED_ROUTES:
      return {
        ...state,
        allowedRoutes: action.payload,
      };
    default:
      return state;
  }
};

export default CommonReducers;
