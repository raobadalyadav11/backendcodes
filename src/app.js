import express from "express";
import cors from "cors";
import cookies from "cookies-parser";
const app = express();

const port=process.env.PORT || 3000

app.use(
  cors({
    origin: process.env.CORS_URL,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "10kb",
    extended: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);
app.use(express.static("public"));

app.use(cookies());

app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});

app.get("/", (req, res) => {
  res.send("hello world");
});
