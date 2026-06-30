import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import userRoutes from "./modules/users/user.routes";

const app = express();

app.use(express.json());
const specs = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Book Management API",
            version: "1.0.0"
        }
    },
    apis: ["./src/routes/*.ts"]
});

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

app.use("/api/users", userRoutes);
app.post("/api/users", userRoutes);
app.delete("/api/users/:id", userRoutes);

export default app;