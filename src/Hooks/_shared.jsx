import { getCookie } from "@/utils/helperFunctions/cookie";
import { useEffect, useState } from "react";

export const useUserDisplayName = (currentUser) => {
  const [userDisplayName, setUserDisplayName] = useState({
    label: "US",
    name: "User",
  });

  const [isNameAvailable, setIsNameAvailable] = useState(false);

  useEffect(() => {
    // Only run on client side after hydration
    const updateUserDisplayName = () => {
      // Try Redux state first
      if (currentUser?.first_name && currentUser?.last_name) {
        setUserDisplayName({
          label:
            currentUser.first_name.charAt(0).toUpperCase() +
            currentUser.last_name.charAt(0).toUpperCase(),
          name: currentUser.first_name + " " + currentUser.last_name,
        });
        return;
      }

      // Fallback to cookies if Redux state not available
      if (typeof window !== "undefined") {
        const firstName = getCookie("first_name");
        const lastName = getCookie("last_name");

        if (firstName && lastName) {
          setUserDisplayName({
            label:
              firstName.charAt(0).toUpperCase() +
              lastName.charAt(0).toUpperCase(),
            name: firstName + " " + lastName,
          });
          setIsNameAvailable(true);
        }
      }
    };

    updateUserDisplayName();
  }, [currentUser]);

  return { userDisplayName, isNameAvailable };
};
