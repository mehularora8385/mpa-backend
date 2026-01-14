const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "MPA API",
    description: "API for the Multi-Point Authentication System",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/app.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
