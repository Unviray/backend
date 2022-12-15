import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API for Sreport",
      version: "0.1.0",
      description:
        "API docs for Sreport",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Unviray",
        email: "unviray@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./routes.js"],
};

const specs = swaggerJsdoc(options);

export default specs;
