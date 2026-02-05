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
import uploadRoute from "./routes/upload.route";
import adminCategoryRoute from "./routes/admin.category.route";
import categoryRoute from "./routes/category.route";
import productRoute from "./routes/product.route";
import adminProductRoute from "./routes/admin.product.route";
import cartRoute from "./routes/cart.route";
import orderRoute from "./routes/order.route";
import adminOrderRoute from "./routes/admin.order.route";
import reviewRoute from "./routes/review.route";
import adminReviewRoute from "./routes/admin.review.route";
import inquiryRoute from "./routes/inquiry.route";
import adminInquiryRoute from "./routes/admin.inquiry.route";

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

app.use("/api/uploads", uploadRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/inquiries", inquiryRoute);
app.use("/api/admin/users", adminUserRoute);
app.use("/api/admin/categories", adminCategoryRoute);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/admin/orders", adminOrderRoute);
app.use("/api/admin/reviews", adminReviewRoute);
app.use("/api/admin/inquiries", adminInquiryRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
    console.log(`📄 Swagger Docs available at http://localhost:${PORT}/${API_DOCS_ROUTE}`);
});
