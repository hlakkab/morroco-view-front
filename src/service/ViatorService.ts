import axios from "axios";
import { Entertainment } from "../store/entertainmentSlice";


const BASE_URL = "https://api.viator.com/partner/products/search";
const API_KEY = "964e58e6-cc92-459a-9b48-d8136be1c08d";


const listEntertainments = async () => {
  const response = await axios.post<{ products: Entertainment[] }>(
    BASE_URL, {
      filtering: {
        destination: "5408",
      },
      pagination: {
        page: 1,
        count: 5,
      },
      currency: "USD"
    }, 
    {
      headers: {
        "exp-api-key": API_KEY,
        "Accept": "application/json;version=2.0",
        "Accept-Language": "en-US",
      }
  });
  return response.data.products;
}

export default {
  listEntertainments
}
