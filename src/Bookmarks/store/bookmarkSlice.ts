import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark, BookmarkState } from '../types/bookmark';
import { api } from '../../service';
import { PaginatedResponse } from '../../types/pagination';
import { getBookmarkFirstImageWithCheck } from '../../utils/imageUtils';

/**
 * Helper function to extract code from bookmark object
 * Tries multiple possible properties in order of preference
 */
const getBookmarkCode = (bookmark: Bookmark): string | null => {
  // Try different possible code properties
  const possibleCodes = [
    bookmark.object?.code,
    bookmark.object?.productCode,
    bookmark.object?.id,
    bookmark.elementId
  ];
  
  for (const code of possibleCodes) {
    if (code && typeof code === 'string' && code.trim() !== '') {
      return code;
    }
  }
  
  return null;
};



const initialState: BookmarkState = {
  bookmarks: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
};

// Async thunks
export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchBookmarks',
  async (params?: { page?: number; size?: number }) => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const response = await api.get<PaginatedResponse<Bookmark>>(`/bookmarks?page=${page}&size=${size}`);
    
    // Process bookmarks to check image formats
    const processedBookmarks = await Promise.all(
      response.data.content.map(async (bookmark: Bookmark) => {
        // If images are empty, check for webp or jpg
        if (!bookmark.images || bookmark.images.length === 0) {
          const code = getBookmarkCode(bookmark);
          
          if (code) {
            // Use HEAD request to check which format exists
            const imageUrl = await getBookmarkFirstImageWithCheck(code);
            return {
              ...bookmark,
              images: imageUrl ? [imageUrl] : []
            };
          }
        }
        return bookmark;
      })
    );
    
    return {
      ...response.data,
      content: processedBookmarks
    };
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
        
        // Bookmarks are already processed with HEAD-checked images
        state.bookmarks = action.payload.content;
        
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageSize = action.payload.size;
        
        console.log(`✅ Fetched ${state.bookmarks.length} bookmarks (page ${state.currentPage + 1}/${state.totalPages})`);
        
        // Log summary of image status
        const withImages = state.bookmarks.filter(b => b.images && b.images.length > 0).length;
        const withoutImages = state.bookmarks.length - withImages;
        console.log(`📸 Images: ${withImages} with images, ${withoutImages} without`);
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