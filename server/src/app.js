const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet')
const cors = require('cors');

const morgan = require('morgan')
const api_v1 = require('./routes/api_v1')



//middleware
app.use(helmet()); // for security.
app.use(cors({
    origin: ['https://localhost:3002', 'http://54.145.28.153:8000/', 'https://localhost:3002', 'https://localhost:3000', 'https://64.227.46.35:8000/']
}));

// Middleware to set headers
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Origin-Agent-Cluster', '?1');
    next();
  });
app.use(express.json());
app.use(morgan('combined'));

// middleware to server static files/ index.html
app.use(express.static(path.join(__dirname,'..', 'public')));

// routes middleware
app.use('/v1', api_v1);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app;

// 1. Model - base
// 2. Controller
// 3. Router