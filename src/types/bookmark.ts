export interface Bookmark {
  id: string;
  image: string;
  title: string;
}

export interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
}