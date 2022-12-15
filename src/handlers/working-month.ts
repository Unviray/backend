import type { Request, Response } from "express";

import { MonthNames, MonthNamesShort } from "../constant/month";
import { TWorkingMonth } from "../types/month";

export const workingMonth = (req: Request, res: Response) => {
  res.json(req.app.get("workingMonth"));
};

export const workingMonthSet = (
  req: Request<{}, {}, TWorkingMonth>,
  res: Response
) => {
  req.app.set("workingMonth", { month: req.body.month, year: req.body.year });
  res.json(req.app.get("workingMonth"));
};

export const prettieWorkingMonth = (
  req: Request<{}, {}, {}, { format?: "long" | "short" }>,
  res: Response
) => {
  const { format = "long" } = req.query;
  const wm = req.app.get("workingMonth");

  if (format === "long") {
    res.json(`${MonthNames[wm.month - 1]} ${wm.year}`);
  } else {
    res.json(`${MonthNamesShort[wm.month - 1]} ${wm.year}`);
  }
};

export const unprettifyWorkingMonth = (
  req: Request<{}, {}, {}, { value: string }>,
  res: Response
) => {
  const { value } = req.query;
  const [m, year] = value.split(" ");

  if (MonthNames.findIndex((monthName) => monthName === m) !== -1) {
    res.json({
      month: MonthNames.findIndex((monthName) => monthName === m) + 1,
      year: parseInt(year),
    });
  } else {
    res.json({
      month: MonthNamesShort.findIndex((monthName) => monthName === m) + 1,
      year: parseInt(year),
    });
  }
};
