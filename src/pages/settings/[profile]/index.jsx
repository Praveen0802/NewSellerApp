import SettingPage from "@/components/settingPage";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { fetchSettingsPageDetails } from "@/utils/serverSideRequests";
import React from "react";

const Settings = (props) => {
  return <SettingPage {...props} />;
};

export default Settings;

export async function getServerSideProps(ctx) {
  const { profile } = ctx?.query;
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await fetchSettingsPageDetails(profile, authToken);
  return {
    props: { profile, apiData: response ?? {} },
  };
}
