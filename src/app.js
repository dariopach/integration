import express from "express";
import handlebars from "express-handlebars";
import productRoutes from "./routes/productRoutes.js";
import viewsRouter from "./routes/viewsRouter.js";
import __dirname from "./utils/constantsUtil.js";
import mongoose from "mongoose";
import cartsRouter from "./routes/cartsRouter.js";

const uri = "mongodb://127.0.0.1:27017/ecommerce";
mongoose.connect(uri);

const app = express();

//Handlebars config
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/../views");
app.set("view engine", "handlebars");

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extend: true }));
app.use(express.static("public"));

//Routers
app.use("/api/product", productRoutes);
app.use("/products", viewsRouter);
app.use("/api/carts", cartsRouter);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Start server in PORT ${PORT}`);
});
