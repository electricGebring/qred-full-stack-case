import express from "express";
import cors from "cors";
import { getCompanies, getDashboard } from "./database.js";

const app = express();
const port = 3000;

app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/companies", (_request, response) => {
  response.json(getCompanies());
});

app.get("/api/dashboard", (request, response) => {
  const companyId = request.query.companyId;

  if (typeof companyId !== "string") {
    response.status(400).json({ error: "companyId query parameter is required" });
    return;
  }

  try {
    response.json(getDashboard(companyId));
  } catch {
    response.status(404).json({ error: "Company not found" });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
