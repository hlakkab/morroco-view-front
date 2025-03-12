import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import QRCode from "../types/qrcode";
import { api } from "../service";

// Define the initial state with loading and error states
interface QRCodeState {
  items: QRCode[];
  loading: boolean;
  error: string | null;
}

const initialState: QRCodeState = {
  items: [],
  loading: false,
  error: null
};

// Async thunks for API operations
export const fetchQRCodes = createAsyncThunk(
  'qrcode/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/qr-codes');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch QR codes');
    }
  }
);

export const createQRCode = createAsyncThunk(
  'qrcode/create',
  async (qrCode: Omit<QRCode, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/qr-codes', qrCode);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create QR code');
    }
  }
);



const qrCodeSlice = createSlice({
  name: 'qrcode',
  initialState,
  reducers: {
    addQRCode: (state, action: PayloadAction<QRCode>) => {
      state.items.push(action.payload);   
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchQRCodes
      .addCase(fetchQRCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQRCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQRCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Handle createQRCode
      .addCase(createQRCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQRCode.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createQRCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  }
});

export const { addQRCode } = qrCodeSlice.actions;
export default qrCodeSlice.reducer;
