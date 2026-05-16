const swaggerJsdoc = require("swagger-jsdoc");
const env = require("../config/env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: `${env.APP_NAME} API`,
      version: "1.0.0",
      description:
        "Authentication and role management API for admins, mentors, and interns on the DSHub Graduation Digital Experience Platform."
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local API server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/modules/**/*.routes.js"]
};

module.exports = swaggerJsdoc(options);
