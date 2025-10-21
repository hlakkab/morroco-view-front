// service/ViatorService.ts
import axios from "axios";
import { Entertainment, EntertainmentFilters, EntertainmentListResponse } from "../Entertainment/types/Entertainment";
import api from "./ApiProxy";

const BASE_URL = "https://api.viator.com/partner/products/search";
const DETAIL_BASE_URL = "https://api.viator.com/partner/products";
const API_KEY = "964e58e6-cc92-459a-9b48-d8136be1c08d";


const listEntertainments0 = async (cityCode: string = "5408") => {
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

const listEntertainments = async (filters: EntertainmentFilters = {}): Promise<EntertainmentListResponse> => {
  // Build query parameters
  const params: Record<string, any> = {};
  
  if (filters.city) params.city = filters.city;
  if (filters.type) params.type = filters.type;
  if (filters.minRating !== undefined) params.minRating = filters.minRating;
  if (filters.maxRating !== undefined) params.maxRating = filters.maxRating;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.size !== undefined) params.size = filters.size;
  if (filters.sort) params.sort = filters.sort;

  const response = await api.get<EntertainmentListResponse>("/entertainments", { params });
  return response.data;
};

const getProductDetail = async (productCode: string) => {
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
