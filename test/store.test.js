const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const storeRoutes = require("../routes/store"); 
const logger = require("../config/logger");

const app = express();
app.use(bodyParser.json());
app.use("/api/store", storeRoutes(logger));

describe("Store Routes", () => {
  let adminToken;
  let userToken;

  before(() => {
    // Create tokens for admin and user
    adminToken = jwt.sign(
      { email: "admin@example.com", role: "admin" },
      process.env.ACCESS_SECRET_TOKEN,
      { expiresIn: "1h" }
    );

    userToken = jwt.sign(
      { email: "user@example.com", role: "user" },
      process.env.ACCESS_SECRET_TOKEN,
      { expiresIn: "1h" }
    );
  });

  describe("GET /api/store/all", () => {
    it("should return all store items for admin", (done) => {
      request(app)
        .get("/api/store/all")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("items").that.is.an("array");
          done();
        });
    });

    it("should return all store items for user", (done) => {
      request(app)
        .get("/api/store/all")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("items").that.is.an("array");
          done();
        });
    });

    it("should return 401 for unauthenticated access", (done) => {
      request(app)
        .get("/api/store/all")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("message", "Access denied");
          done();
        });
    });
  });

  describe("POST /api/store/add", () => {
    it("should add items to the store for admin", (done) => {
      request(app)
        .post("/api/store/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ items: ["NewItem"] })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property(
            "message",
            "Successfully added the items"
          );
          expect(res.body).to.have.property("items").that.includes("NewItem");
          done();
        });
    });

    it("should return 403 for non-admin user", (done) => {
      request(app)
        .post("/api/store/add")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ items: ["NewItem"] })
        .expect(403)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("message", "Forbidden");
          done();
        });
    });

    it("should return 400 for invalid input", (done) => {
      request(app)
        .post("/api/store/add")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ items: "" })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property("message", "Invalid input data");
          done();
        });
    });
  });
});
