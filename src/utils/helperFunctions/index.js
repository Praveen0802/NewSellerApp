import { getTeamMembers, refreshAuthToken } from "../apiHandler/request";
import { readCookie } from "./cookie";

export function formatDate(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayOfWeek = days[date.getDay()];
  const dayOfMonth = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
}

export const convertSnakeCaseToCamelCase = (snakeCase) => {
  // Split the string by underscores
  const words = snakeCase.split("_");

  // Capitalize the first letter of each word
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join the words with spaces
  return capitalizedWords.join(" ");
};

export const nextRedirect = (pathName = "login") => {
  return {
    redirect: {
      permanent: false,
      destination: `/${pathName}`,
    },
  };
};

export const getAuthToken = (context = null, token) => {
  const isClient = typeof window !== "undefined";
  const authToken = token
    ? token
    : isClient
    ? readCookie("auth_token")
    : context?.req?.cookies?.auth_token;

  return authToken ? decodeURIComponent(authToken) : null;
};

export const currentTimeEpochTimeInMilliseconds = () => {
  return new Date().getTime();
};

export const checkAuthTokenValidationMiddleWare = async (
  authToken,
  timeValidity
) => {
  if (!authToken || !timeValidity) return false;
  const currentTimeEpoch = currentTimeEpochTimeInMilliseconds();
  const tokenTimeEpoch = Number(timeValidity);
  // Changed from 3600000 (1 hour) to 60000 (1 minute)
  const timeDiffBolean = tokenTimeEpoch > currentTimeEpoch - 3600000;
  if (timeDiffBolean) {
    return true;
  } else {
    const fetchNewAuthToken = await refreshAuthToken(authToken);
    return fetchNewAuthToken;
  }
};

export const checkValidAuthToken = (context = null, authToken) => {
  const isClient = typeof window != "undefined";
  const tokenDecoded = authToken
    ? authToken
    : isClient
    ? readCookie("auth_token")
    : context?.req?.cookies?.auth_token;
  const token = decodeURIComponent(tokenDecoded);
  const fetchAuthTokenTime = isClient
    ? readCookie("auth_token_validity")
    : context?.req?.cookies?.auth_token_validity;
  if (!token || !fetchAuthTokenTime) return false;

  const currentTimeEpoch = currentTimeEpochTimeInMilliseconds();
  const tokenTimeEpoch = Number(fetchAuthTokenTime);
  const timeDiffBolean = tokenTimeEpoch > currentTimeEpoch - 3600000;
  return timeDiffBolean;
};

export const clearUserCookie = async () => {
  const cookiesToDelete = ["auth_token", "sessionData"];
  const deleteCookieStrings = cookiesToDelete.map(
    (cookieName) =>
      `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict`
  );
  return deleteCookieStrings;
};

export const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

export function isEmptyObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  );
}

export const desiredFormatDate = (dateString) => {
  const date = new Date(dateString);

  const options = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return formattedDate;
};

export const dateFormat = (dateString) => {
  // Parse the input date string (YYYY-MM-DD)
  if (!dateString) return "";
  const parts = dateString?.split("-");

  // Rearrange to DD/MM/YYYY format
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const formatDateValue = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert to milliseconds

  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formattedDate = date
    .toLocaleDateString("en-GB", options)
    .replace(/(\w+), (\d+) (\w+) (\d+), (\d+:\d+)/, "$1, $2 $3 $4, $5");

  return formattedDate;
};

export function convertKeyToDisplayName(key) {
  return (
    key
      // First handle camelCase by inserting spaces before uppercase letters
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Then handle underscores
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}
// If you want the currency code to be fully uppercase:
function convertKeyToDisplayNameWithUpperCurrency(key) {
  const words = key.split("_");
  const lastWord = words[words.length - 1];

  // Check if last word is a currency code (3 letters)
  if (lastWord.length === 3) {
    words[words.length - 1] = lastWord.toUpperCase();
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const constructTeamMembersDetails = async () => {
  const teamMembers = await getTeamMembers();
  return teamMembers?.my_teams?.map((member) => {
    return {
      label: member?.first_name,
      value: member?.id,
    };
  });
};

export function formatDateToBoldDisplay(dateString) {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Array of day names
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Array of month names
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get the day name, day number, month name, and year
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  // Return formatted string
  return `${dayName}, ${day} ${monthName} ${year}`;
}
