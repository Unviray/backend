import { TWorkingMonth } from "./types/month";

export class Month {
  value: TWorkingMonth;

  constructor(value: TWorkingMonth) {
    this.value = value;
  }

  nextMonth(): TWorkingMonth {
    if (this.value.month === 12) {
      return { month: 1, year: this.value.year + 1 };
    }

    return {
      month: (this.value.month + 1) as TWorkingMonth["month"],
      year: this.value.year,
    };
  }

  prevMonth(): TWorkingMonth {
    if (this.value.month === 1) {
      return { month: 12, year: this.value.year - 1 };
    }

    return {
      month: (this.value.month - 1) as TWorkingMonth["month"],
      year: this.value.year,
    };
  }

  lessThan(toCompare: TWorkingMonth | { month: 0; year: 0 }, equal?: boolean) {
    if (toCompare.month === 0 && toCompare.year === 0) {
      return true;
    }
    if (this.value.year === toCompare.year) {
      return equal
        ? this.value.month <= toCompare.month
        : this.value.month < toCompare.month;
    }

    return equal
      ? this.value.year <= toCompare.year
      : this.value.year < toCompare.year;
  }

  greaterThan(toCompare: TWorkingMonth, equal?: boolean) {
    if (this.value.year === toCompare.year) {
      return equal
        ? this.value.month >= toCompare.month
        : this.value.month > toCompare.month;
    }

    return equal
      ? this.value.year >= toCompare.year
      : this.value.year > toCompare.year;
  }

  between(
    start: TWorkingMonth,
    end: TWorkingMonth,
    startInclusif = true,
    endInclusif = true
  ) {
    return (
      this.greaterThan(start, startInclusif) && this.lessThan(end, endInclusif)
    );
  }
}
