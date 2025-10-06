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
  async (id: string, { dispatch }) => {
    try {
      // First update the local state optimistically
      dispatch(removeBookmarkLocally(id));
      // Then make the API call
      await api.delete(`/bookmarks/${id}`);
      return id;
    } catch (error) {
      // If the API call fails, we should revert the local state
      dispatch(addBookmarkLocally(id));
      throw error;
    }
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    removeBookmarkLocally: (state, action) => {
      state.bookmarks = state.bookmarks.filter(
        (bookmark) => bookmark.id !== action.payload
      );
    },
    addBookmarkLocally: (state, action) => {
      // This is used to revert the optimistic update if the API call fails
      // You might want to store the removed bookmark temporarily to restore it
      // For now, we'll just log the error
      console.error('Failed to remove bookmark:', action.payload);
    }
  },
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
        state.error = null;
      })
      .addCase(removeBookmark.fulfilled, (state) => {
        // The local state is already updated by removeBookmarkLocally
        state.loading = false;
      })
      .addCase(removeBookmark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove bookmark';
      });
  },
});

export const { removeBookmarkLocally, addBookmarkLocally } = bookmarkSlice.actions;
export default bookmarkSlice.reducer; 