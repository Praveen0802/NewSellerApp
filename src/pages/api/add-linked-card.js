import { API_ROUTES } from "@/utils/apiHandler/apiRoutes";
import { parseCookie } from "@/utils/helperFunctions/cookie";
import axios from "axios";

export default async function handler(req, res) {
  const method = req?.method;
  const { headers } = req;
  const { card_id } = req?.body;
  console.log(card_id, req?.body, "card_idcard_idcard_id");
  const formData = new FormData();
  formData.append("card_id", card_id);
  const parsedCookie = parseCookie(headers?.cookie);
  const authToken = decodeURIComponent(parsedCookie?.auth_token);
  
  await axios({
    url: `${process.env.API_BASE_URL}${API_ROUTES?.ADD_SAVED_CARDS}`,
    method,
    data: formData,
    ...(authToken && {
      headers: {
        Authorization: `Bearer ${authToken}`,
        domainkey: process.env.DOMAIN_KEY,
      },
    }),
  })
    .then((response) => {
      res.status(200).json(response?.data);
    })
    .catch(async (err) => {
        console.log(err, "errerr");
      const statusCode = err?.response?.status || 500;
      const responseData = err?.response?.data || {
        message: "Internal Server Error",
      };
      res.status(statusCode).json(responseData);
    });
}
