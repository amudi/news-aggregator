export interface NewsCreateInput {
  title: string;
  publishedAt: Date;
  state: string;
  summary: string;
  articleUrl: string;
  topics: string[];
  snippet: string;
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
