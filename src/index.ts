import express from "express";
import swaggerUi from "swagger-ui-express";

import middlewares from "./middleware";
import routes from "./routes";
import specs from "./docs";

const app = express();

for (const middleware of middlewares) {
  app.use(middleware);
}

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

const initialMonth = new Date();
initialMonth.setMonth(initialMonth.getMonth() - 1);

app.set("workingMonth", {
  month: initialMonth.getMonth() + 1,  // Because getMonth() return 0 - 11
  year: initialMonth.getFullYear(),
});

for (const [path, handler] of Object.entries(routes)) {
  handler.get && app.get(path, handler.get);
  handler.post && app.post(path, handler.post);
}

export { app };
