import express from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from 'cookie-parser';
import swaggerJsdoc from "swagger-jsdoc";
import authRouters from "./routes/authRoute";
import userRouters from "./routes/userRoute";
import roleRoute from "./routes/roleRoute";
import cors from "cors";
import bookRouters from "./routes/bookRoute";


const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());
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


app.use("/api/auth", authRouters)
app.use("/api/user", userRouters);
app.use("/api/book",bookRouters)
app.use("/api/role", roleRoute);
app.use('/images', express.static('images'));

export default app;