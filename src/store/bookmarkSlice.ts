import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark, BookmarkState } from '../types/bookmark';
import { api } from '../service';



const initialState: BookmarkState = {
  bookmarks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchBookmarks',
  async () => {
    const response = await api.get(`/bookmarks`);
    return response.data;
  }
);

export const addBookmark = createAsyncThunk(
  'bookmarks/addBookmark',
  async (bookmark: Bookmark) => {
    const response = await api.post(`/bookmarks`, bookmark);
    return response.data;
  }
);

export const removeBookmark = createAsyncThunk(
  'bookmarks/removeBookmark',
  async (id: string) => {
    await api.delete(`/bookmarks/${id}`);
    return id;
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookmarks';
      })
      // Add bookmark
      .addCase(addBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks.push(action.payload);
      })
      .addCase(addBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add bookmark';
      })
      // Remove bookmark
      .addCase(removeBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = state.bookmarks.filter(
          (bookmark) => bookmark.id !== action.payload
        );
      })
      .addCase(removeBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove bookmark';
      });
  },
});

export default bookmarkSlice.reducer; 