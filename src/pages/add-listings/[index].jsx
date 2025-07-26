import AddInventoryPage from "@/components/addInventoryPage";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { getAddlistingPageData } from "@/utils/serverSideRequests";

import React from "react";

const Notification = (props) => {
  return <AddInventoryPage {...props} />;
};

export default Notification;

export async function getServerSideProps(ctx) {
  const { index } = ctx?.query;
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await getAddlistingPageData(authToken, index);
  return {
    props: { matchId: index, response },
  };
}
