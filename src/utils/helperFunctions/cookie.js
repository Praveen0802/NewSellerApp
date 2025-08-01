export const readCookie = function (name) {
  const nameEQ = `${name}=`;
  const ca = typeof window === "object" ? document.cookie?.split(";") : "";
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);

    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const setCookie = (name, value, options = {}) => {
  const {
    expires,
    daysToExpire,
    path = '/',
    domain,
    secure,
    sameSite
  } = options;

  let cookieString = `${name}=${value}`;
  
  // Handle expiration
  if (expires) {
    cookieString += `; expires=${expires}`;
  } else if (daysToExpire !== undefined) {
    if (daysToExpire <= 0) {
      // For deletion, use a past date
      cookieString += '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } else {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + daysToExpire);
      cookieString += `; expires=${expirationDate.toUTCString()}`;
    }
  }
  
  cookieString += `; path=${path}`;
  
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;
  
  document.cookie = cookieString;
  console.log(`Setting cookie: ${cookieString}`);
};

export function getCookie(name) {
  // Add = to the name to ensure we find the exact cookie name and not a substring
  const nameEQ = name + "=";
  // Split the cookie string by semicolons into an array
  const cookies = document.cookie.split(";");

  // Loop through all cookies
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    // Remove leading spaces if any
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    // If this cookie starts with the name we're looking for
    if (cookie.indexOf(nameEQ) === 0) {
      // Return the cookie value (everything after the name=)
      return cookie.substring(nameEQ.length);
    }
  }
  // If cookie not found, return null
  return null;
}

// Example usage:
// const authToken = getCookie("auth_token");

export const parseCookie = (str) =>
  str
    ?.split(";")
    ?.map((v) => v.split("="))
    ?.reduce((acc, v) => {
      acc[decodeURIComponent(v[0]?.trim())] = decodeURIComponent(v[1]?.trim());
      return acc;
    }, {});

export const getMiddlewareCookieValue = (cookies, key) => {
  const cookiesObj = {};
  if (cookies) {
    cookies.split(";").map((cookie) => {
      const indexOfEqualTo = cookie.indexOf("=");
      const key = cookie.slice(0, indexOfEqualTo);
      const value = cookie.slice(indexOfEqualTo + 1);
      cookiesObj[key.trim()] = value.trim();
    });
  }
  return cookiesObj[key];
};
