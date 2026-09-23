import request from "supertest";
import { expect, test } from "vitest";
import app from "./index.js";

test("GET /api/companies returns the available companies", async () => {
  const response = await request(app).get("/api/companies");

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    { id: "company-ab", name: "Company AB" },
    { id: "company-nordic", name: "Nordic AB" }
  ]);
});

test("GET /api/dashboard requires a companyId", async () => {
  const response = await request(app).get("/api/dashboard");

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    error: "companyId query parameter is required"
  });
});

test("GET /api/dashboard returns exactly five demo transactions for each company", async () => {
  const firstResponse = await request(app)
    .get("/api/dashboard?companyId=company-ab");

  expect(firstResponse.status).toBe(200);
  expect(firstResponse.body.transactions).toHaveLength(5);

  const secondResponse = await request(app)
    .get("/api/dashboard?companyId=company-nordic");

  expect(secondResponse.status).toBe(200);
  expect(secondResponse.body.transactions).toHaveLength(5);
});

test("GET /api/dashboard returns 404 for an unknown company", async () => {
  const response = await request(app)
    .get("/api/dashboard?companyId=does-not-exist");

  expect(response.status).toBe(404);
  expect(response.body).toEqual({ error: "Company not found" });
});

test("card status can be deactivated and activated", async () => {
  const deactivation = await request(app)
    .post("/api/cards/company-ab/deactivate");

  expect(deactivation.status).toBe(200);
  expect(deactivation.body).toEqual({ status: "inactive" });

  const activation = await request(app)
    .post("/api/cards/company-ab/activate");

  expect(activation.status).toBe(200);
  expect(activation.body).toEqual({ status: "active" });
});
