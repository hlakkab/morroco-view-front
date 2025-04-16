// service/ViatorService.ts
import axios from "axios";
import { Entertainment } from "../types/Entertainment";

const BASE_URL = "https://api.viator.com/partner/products/search";
const DETAIL_BASE_URL = "https://api.viator.com/partner/products";
const API_KEY = "964e58e6-cc92-459a-9b48-d8136be1c08d";


const listEntertainments = async (cityCode: string = "5408") => {
  const response = await axios.post<{ products: Entertainment[] }>(
    BASE_URL, {
      filtering: {
        destination: cityCode,
        tags: [20217, ]
      },
      pagination: {
        page: 1,
        count: 20,
      },
      currency: "USD"
    },
    {
      headers: {
        "exp-api-key": API_KEY,
        "Accept": "application/json;version=2.0",
        "Accept-Language": "en-US",
      }
    }
  );
  return response.data.products;
};

// Fonction pour récupérer le détail d'un produit
const getProductDetail = async (productCode: string): Promise<any> => {
  const url = `${DETAIL_BASE_URL}/${productCode}?campaign-value=exampleCampaign&target-lander=NONE`;
  const response = await axios.get(url, {
    headers: {
      "exp-api-key": API_KEY,
      "Accept": "application/json;version=2.0",
      "Accept-Language": "en-US",
    }
  });
  return response.data;
};

export default {
  listEntertainments,
  getProductDetail,
};
