import { allCountryCodes } from "../utils/constants/allContryCodes";
const useCountryCodes = () => {
  const allCountryCodeOptions = allCountryCodes?.data?.map((item) => {
    return {
      label: `${item?.short_name} ${item?.dialing_code}`,
      value: `${item?.phone_code}`,
    };
  });
  return { allCountryCodeOptions };
};

export default useCountryCodes;
