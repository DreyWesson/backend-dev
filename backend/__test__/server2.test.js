import request from "supertest";
import { Server, defaultMiddlewares, routes, errorHandlers } from "../app.js";
import config from "../config/index.js";
import { Logger } from "../services/logger.js";
import * as homeController from "../controllers/index.js";

jest.mock("../services/logger.js");

describe("Server Integration Tests", () => {
  let server, runningServer;

  // Run before each test to ensure a clean state
  beforeEach(async () => {
    server = await Server.create({
      config: { ...config, PORT: 4001 }, // Use a test-specific port
      middlewares: defaultMiddlewares,
      routes,
      errorHandlers,
      allEndpoints: { homeController },
    });
    runningServer = await server.start();
  });

  // Close the server after each test to free up the port
  afterEach(async () => {
    await server.stop(runningServer);
  });

  test("should return 200 OK for the home route", async () => {
    const response = await request(server.app).get("/api/v1/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Database is live..." });
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("should return 404 for an unknown route", async () => {
    const response = await request(server.app).get("/api/v1/unknown");
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Not found" });
  });

  test("should handle errors and return 500 for a deliberate error route", async () => {
    const response = await request(server.app).get("/error");
    expect(response.statusCode).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.errors).toContain("Internal Server Error");
    expect(Logger.writeServerError).toHaveBeenCalledWith(expect.stringContaining("Deliberate error"));
  });

  test("should include security headers", async () => {
    const response = await request(server.app).get("/api/v1/");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("should parse JSON request bodies correctly", async () => {
    const payload = { data: "test" };
    const response = await request(server.app)
      .post("/api/v1/test-endpoint")
      .send(payload)
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(payload);
  });

  test("should handle async errors gracefully", async () => {
    const response = await request(server.app).get("/api/v1/async-error");
    expect(response.statusCode).toBe(500);
    expect(Logger.writeServerError).toHaveBeenCalledWith(expect.stringContaining("Async error"));
  });

  test("should handle large payloads", async () => {
    const largePayload = { data: "x".repeat(100000) };
    const response = await request(server.app)
      .post("/api/v1/large-payload")
      .send(largePayload)
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ message: "Payload received" });
  });

  test("should log requests correctly", async () => {
    await request(server.app).get("/api/v1/");
    expect(Logger.writeLog).toHaveBeenCalledWith(
      "info",
      expect.any(String),
      expect.stringContaining("GET")
    );
  });

  test("should return 401 for unauthorized requests", async () => {
    const response = await request(server.app)
      .get("/api/v1/protected-resource")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  test("should apply rate limiting correctly", async () => {
    for (let i = 0; i < 5; i++) {
      await request(server.app).get("/api/v1/rate-limited-endpoint");
    }
    const response = await request(server.app).get("/api/v1/rate-limited-endpoint");
    expect(response.statusCode).toBe(429);
    expect(response.body.message).toBe("Too many requests, please try again later.");
  });
});
