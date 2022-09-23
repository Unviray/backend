import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import type { TMonthNumbers } from "../types/month";

const initialMonth = new Date();
initialMonth.setMonth(initialMonth.getMonth() - 1);

const workingMonthSlice = createSlice({
  name: "workingMonth",
  initialState: initialMonth.toJSON(),
  reducers: {
    setMonth: (state: string, action: PayloadAction<TMonthNumbers>) => {
      const newState = new Date(state);
      newState.setMonth(action.payload - 1);
      state = newState.toJSON();
    },
    setYear: (state: string, action: PayloadAction<number>) => {
      const newState = new Date(state);
      newState.setFullYear(action.payload);
      state = newState.toJSON();
    },
  },
});

const { setMonth, setYear } = workingMonthSlice.actions;

const store = configureStore({
  reducer: workingMonthSlice.reducer,
});

export const getWorkingMonth = () => {
  const date = new Date(store.getState());
  return {
    month: (date.getMonth() + 1) as TMonthNumbers,
    year: date.getFullYear(),
  };
};

export const setWorkingMonth = (month: TMonthNumbers, year: number) => {
  store.dispatch(setMonth(month));
  store.dispatch(setYear(year));
};
