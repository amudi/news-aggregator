export interface News {
  id: string;
  title: string;
  publishedAt: string;
  state: string;
  summary: string;
  articleUrl: string;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
  snippet: string;
}

export interface Topic {
  id: string;
  name: string;
}

export interface NewsResponse {
  status: string;
  data: News[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NewsFilters {
  page: number;
  limit: number;
  search: string;
  topic?: string;
  state?: string;
  sortBy: 'publishedAt' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface NewsQueryParams {
  page?: number;
  limit?: number;
  state?: string;
  topic?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface NewsDetailResponse {
  status: string;
  data: News;
}
