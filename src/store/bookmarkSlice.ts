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
  async (body: {elementId: string, type: string}) => {
    const response = await api.post(`/bookmarks`, body);
    return response.status;
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