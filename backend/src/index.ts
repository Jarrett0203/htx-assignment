import "dotenv/config";
import express from "express";
import router from "./routes/index.ts";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running");
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(router);