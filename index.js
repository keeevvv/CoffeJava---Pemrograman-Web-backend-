import express from "express";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(router);
app.listen(3000, () => {
  console.log("server running on port 3000");
});
