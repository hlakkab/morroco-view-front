import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Esim from '../../types/esim';
import api from '../../service/ApiProxy';

interface EsimState {
  esims: Esim[];
  loading: boolean;
  error: string | null;
}

const initialState: EsimState = {
  esims: [],
  loading: false,
  error: null,
};

export const fetchEsims = createAsyncThunk(
  'esim/fetchEsims',
  async () => {
    try {
      const response = await api.get<Esim[]>('/esims');
      return response.data;
    } catch (error) {
      console.error('Error fetching ESIMs:', error);
      throw error;
    }
  }
);

export const createEsim = createAsyncThunk(
  'esim/createEsim',
  async (esim: Omit<Esim, 'id'>) => {
    try {
      const response = await api.post<Esim>('/esims', esim);
      return response.data;
    } catch (error) {
      console.error('Error creating ESIM:', error);
      throw error;
    }
  }
);

const esimSlice = createSlice({
  name: 'esim',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch ESIMs
      .addCase(fetchEsims.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEsims.fulfilled, (state, action) => {
        state.loading = false;
        state.esims = action.payload;
      })
      .addCase(fetchEsims.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ESIMs';
      })
      // Create ESIM
      .addCase(createEsim.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEsim.fulfilled, (state, action) => {
        state.loading = false;
        state.esims.push(action.payload);
      })
      .addCase(createEsim.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create ESIM';
      });
  },
});

export default esimSlice.reducer; 