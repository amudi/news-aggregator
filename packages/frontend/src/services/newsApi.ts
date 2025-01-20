import axios from 'axios';
import {
  NewsQueryParams,
  NewsResponse,
  NewsDetailResponse,
} from '@/types/news';
import { handleApiError } from '@/utils/apiErrors';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const newsApi = {
  getNews: async (params: NewsQueryParams): Promise<NewsResponse> => {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        state: params.state,
        topic: params.topic,
        search: params.search,
        sortBy: params.sortBy || 'publishedAt',
        order: params.order || 'desc',
      };

      const response = await axiosInstance.get('/news', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getNewsById: async (id: string): Promise<NewsDetailResponse> => {
    try {
      const response = await axiosInstance.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
