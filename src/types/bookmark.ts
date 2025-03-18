export interface Bookmark {
  id: string;
  images: string[];
  type: string;
  object: any;
}

export interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
}