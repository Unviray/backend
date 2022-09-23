import express from "express";

import middlewares from "./middleware";
import routes from "./routes";

const app = express();

for (const middleware of middlewares) {
  app.use(middleware);
}

for (const [path, handler] of Object.entries(routes)) {
  handler.get && app.get(path, handler.get);
  handler.post && app.post(path, handler.post);
}

export const sreport = app;
