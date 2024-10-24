// server.integration.test.js
import request from 'supertest';
import express from 'express';
import { Server } from './app.js'; // Adjust the path as necessary
import { defaultMiddlewares, routes, errorHandlers } from './app.js';

const config = {
  PORT: 4000, // Use a different port to avoid conflicts during testing
};

describe('Server Integration Tests', () => {
  let server;
  let runningServer;

  beforeAll(async () => {
    // Set up the server instance before all tests
    server = await Server.create({
      config,
      middlewares: defaultMiddlewares,
      routes,
      errorHandlers,
      allEndpoints: {
        homeController: { 
          getHome: jest.fn((req, res) => res.status(200).json({ message: "Database is live..." })),
        },
      },
    });
  });

  afterAll(async () => {
    // Stop the server after all tests are done to clean up
    if (runningServer) {
      await server.stop(runningServer);
    }
  });

  test('Server starts successfully and responds to /api/v1/ with status 200', async () => {
    runningServer = await server.start();
    const response = await request(server.app).get('/api/v1/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Database is live..." });
  });

  test('Handles unknown routes with 404 status', async () => {
    const response = await request(server.app).get('/non-existent-route');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Not found" });
  });

  test('Handles errors with proper status and response message', async () => {
    const response = await request(server.app).get('/error'); // This route triggers an error
    expect(response.status).toBe(500);
    expect(response.text).toBe('Something broke!'); // This message should match the one sent by error handler
  });

  test('Supports CORS and includes expected headers', async () => {
    const response = await request(server.app)
      .get('/api/v1/')
      .set('Origin', 'http://example.com');
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  test('Returns a unique request ID in response headers', async () => {
    const response = await request(server.app).get('/api/v1/');
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['x-request-id']).toMatch(/^[a-f0-9\-]+$/); // UUID format
  });

  test('Gracefully shuts down the server without errors', async () => {
    await expect(server.stop(runningServer)).resolves.toBeUndefined();
  });
});
