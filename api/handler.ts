import express, { Request, Response } from 'express';

const { app } = express();

module.exports = async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    message: 'API Gateway Test',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  });
};
