import { allCountryCodes } from "../utils/constants/allContryCodes";

const useCountryCodes = () => {
  // Keep existing phone code options structure for backward compatibility
  const allCountryCodeOptions = allCountryCodes?.data?.map((item) => {
    return {
      label: `${item?.short_name} ${item?.dialing_code}`,
      value: `${item?.dialing_code}`,
    };
  });

  // New country options for country field with name as label and id as value
  const countryOptions = allCountryCodes?.data?.map((item) => {
    return {
      label: item?.name,
      value: item?.id.toString(),
    };
  });

  return {
    allCountryCodeOptions, // Keep existing name for phone codes
    countryOptions, // New option for country selection
  };
};

export default useCountryCodes;
