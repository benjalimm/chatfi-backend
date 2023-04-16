import express, { Express, Router } from 'express';
import 'reflect-metadata';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import Container from 'typedi';
import SocketManager from './controllers/SocketManager';
import router from './routers/main';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Body parser middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', router);

// Socket setup
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// Setup and inject socket manager
const socketManager = new SocketManager(server);
Container.set(SocketManager, socketManager);
