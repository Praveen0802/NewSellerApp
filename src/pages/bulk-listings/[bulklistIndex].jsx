import BulkInventoryPage from "@/components/TicketsPage/addBulkListing";
import BulkListings from "@/components/TicketsPage/bulkListing";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import {
  fetchAddBulkListingData,
  fetchBulkListingData,
} from "@/utils/serverSideRequests";
import React from "react";

const Tickets = (props) => {
  return <BulkInventoryPage {...props} />;
};

export default Tickets;

export async function getServerSideProps(ctx) {
  const { k = "", bulklistIndex } = ctx?.query;
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await fetchAddBulkListingData(authToken, k);
  return {
    props: { response },
  };
}
