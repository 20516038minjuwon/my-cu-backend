import express from "express";
import cors from "cors";
import passport from "passport";
import { jwtStrategy } from "./config/passport";
import authRoute from "./routes/auth.route";
import adminUserRoute from "./routes/admin.user.route";
import { validateClientKey } from "./middlewares/clientAuth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { generateOpenApiDocs } from "./config/openApi";
import { apiReference } from "@scalar/express-api-reference";
import userRoute from "./routes/user.route";

const app = express();
const PORT = process.env.PORT || 4101;
const API_DOCS_ROUTE = process.env.API_DOCS_ROUTE || "/api-docs";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
passport.use(jwtStrategy);

const openApiDocument = generateOpenApiDocs();

app.use(
    "/api-docs",
    apiReference({
        spec: { content: openApiDocument },
        theme: "purple",
    }),
);

app.use(validateClientKey);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/admin/users", adminUserRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
    console.log(`📄 Swagger Docs available at http://localhost:${PORT}/${API_DOCS_ROUTE}`);
});
