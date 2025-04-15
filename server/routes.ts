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

  // Add a test route that serves a static HTML page without React
  app.get('/test-static', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Static Test Page</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #0033a0;
          }
          .counter {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 20px 0;
          }
          button {
            background: #ff5900;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
          }
          .count {
            font-size: 24px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>Nedaxer Static Test Page</h1>
        <p>This is a static test page that doesn't use React.</p>
        
        <div class="counter">
          <button id="decrease">Decrease</button>
          <span class="count" id="count">0</span>
          <button id="increase">Increase</button>
        </div>
        
        <p>If you can see this page and the counter works, the server is functioning correctly.</p>
        
        <script>
          // Vanilla JavaScript counter
          let count = 0;
          const countDisplay = document.getElementById('count');
          
          document.getElementById('decrease').addEventListener('click', () => {
            count--;
            countDisplay.textContent = count;
          });
          
          document.getElementById('increase').addEventListener('click', () => {
            count++;
            countDisplay.textContent = count;
          });
        </script>
      </body>
      </html>
    `);
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
