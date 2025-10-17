export interface Bookmark {
  id: string;
  images: string[];
  saved: boolean;
  elementId: string;
  type: string;
  object: any;
}

export interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}