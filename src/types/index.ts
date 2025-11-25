export interface Link {
  id: number;
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export interface CreateLinkRequest {
  url: string;
  customCode?: string;
}

export interface CreateLinkResponse {
  code: string;
  url: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}
