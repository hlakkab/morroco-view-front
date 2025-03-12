export interface Bookmark {
  id: string;
  images: string[];
  type: string;
  title: string;
}

export interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
}