import express, {Application} from "express";
import sequelize from "./config/db";
import mainRoutes from "./routes";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import morgan from "morgan";
import NotFoundException from "./helpers/errors/not-found.exception";
import errorHandlingMiddleware from "./middleware/error-handling.middleware";
import {orderCron} from "./modules/automatic/checkOrderPaid";

const app: Application = express();

dotenv.config();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(morgan("dev"));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api", mainRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.all("*", () => {
    throw new NotFoundException();
});

app.use(errorHandlingMiddleware);

(async () => {
    try {
        await sequelize;
        console.log("Database setup success.");
    } catch (error) {
        console.error("Error init database:", error);
    }
})();

// orderCron();
export default app;
