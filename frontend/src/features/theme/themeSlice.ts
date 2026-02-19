import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type Mode = 'light' | 'dark';

const initialMode = ((): Mode => {
  const saved = localStorage.getItem('theme') as Mode | null;
  return saved ?? 'light';
})();

const slice = createSlice({
  name: 'theme',
  initialState: { mode: initialMode },
  reducers: {
    setMode: (s, a: PayloadAction<Mode>) => { s.mode = a.payload; },
    toggleMode: (s) => { s.mode = s.mode === 'dark' ? 'light' : 'dark'; },
  },
});

export const { setMode, toggleMode } = slice.actions;
export default slice.reducer;
