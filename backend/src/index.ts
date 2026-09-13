import "dotenv/config";
import express from "express";
import router from "./routes/index.ts";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim());

app.get("/", (req, res) => {
  res.send("API is running");
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors(
  {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    }
  }
));
app.use(express.json());
app.use(router);