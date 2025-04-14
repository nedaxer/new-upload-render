import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Route to handle account login page
  app.get('/account/login', (req, res) => {
    res.redirect('/#/account/login');
  });
  
  // Route to handle account registration page
  app.get('/account/register', (req, res) => {
    res.redirect('/#/account/register');
  });
  
  // Route to handle forgot password page
  app.get('/account/forgot-password', (req, res) => {
    res.redirect('/#/account/forgot-password');
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
