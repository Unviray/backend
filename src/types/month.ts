export type TMonthNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type TMonthNames =
  | "Janoary"
  | "Febroary"
  | "Martsa"
  | "Aprily"
  | "Mey"
  | "Jona"
  | "Jolay"
  | "Aogositra"
  | "Septambra"
  | "Oktobra"
  | "Novambra"
  | "Desambra";
export type TMonthNamesShort =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "Mey"
  | "Jon"
  | "Jol"
  | "Aog"
  | "Sept"
  | "Okt"
  | "Nov"
  | "Des";

export type TWorkingMonth = { month: TMonthNumbers; year: number };
