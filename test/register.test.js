const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { expect } = require("chai");
const logger = require("../config/logger");
const userRoutes = require("../routes/users");
const app = express();
app.use(bodyParser.json());
app.use("/api", userRoutes(logger));

describe("POST /api/register", () => {
  it("should register a new user successfully", async () => {
    const response = await request(app).post("/api/register").send({
      email: "test@example.com",
      password: "password123",
      role: "user",
    });

    expect(response.status).to.equal(201);
    expect(response.body)
      .to.have.property("message")
      .that.includes("successfully");
  });

  it("should return validation error for missing fields", async () => {
    const response = await request(app).post("/api/register").send({
      email: "",
      password: "",
      role: "",
    });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("errors").that.is.an("array");
  });

  it("should return validation error for invalid email", async () => {
    const response = await request(app).post("/api/register").send({
      email: "invalid-email",
      password: "password123",
      role: "user",
    });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("errors").that.is.an("array");
  });

  it("should return error for existing email", async () => {
    // First request to register the user
    await request(app).post("/api/register").send({
      email: "test@example.com",
      password: "password123",
      role: "user",
    });

    // Second request with the same email
    const response = await request(app).post("/api/register").send({
      email: "test@example.com",
      password: "password123",
      role: "user",
    });

    expect(response.status).to.equal(400);
    expect(response.body)
      .to.have.property("message")
      .that.includes("Email already exists");
  });
});
