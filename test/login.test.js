const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { expect } = require("chai");
const logger = require("../config/logger");
const userRoutes = require("../routes/users");
const app = express();
app.use(bodyParser.json());
app.use("/api", userRoutes(logger));

describe("Authentication Routes", () => {
  it("POST /api/login - should return 400 for invalid credentials", async () => {
    const response = await request(app).post("/api/login").send({
      email: "invalid@example.com",
      password: "invalid",
      role: "user",
    });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("message").that.is.a("string");
  });

  it("POST /api/login - should return 400 for validation errors", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "invalidemail", password: "", role: "invalid" });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property("errors").that.is.an("array");
  });
});
