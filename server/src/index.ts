import express from "express";
import cors from "cors";
import { dashboard } from "./dashboard.js";

const app = express();
const port = 3000;

app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/dashboard", (_request, response) => {
  response.json(dashboard);
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
