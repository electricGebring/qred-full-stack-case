import express from "express";

const app = express();
const port = 3000;

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
