import type { NextFunction, Request, Response } from "express";

import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";

export default [
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);

    if (status === undefined) {
      return;
    }

    const statusColorMap = {
      "200": "#23FE45",
      "304": "#2EF456",
    };
    return [
      chalk.hex("#34ace0").bold(tokens.method(req, res)),
      chalk
        .hex(
          Object.keys(statusColorMap).includes(status)
            ? statusColorMap[status as "200" | "304"]
            : "#FE3456"
        )
        .bold(tokens.status(req, res)),
      chalk.hex("#34ace0").bold(tokens.url(req, res)),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  }),

  cors(),
];
