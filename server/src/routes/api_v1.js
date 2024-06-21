const express = require('express');
const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const api_v1 = express.Router();


api_v1.use('/planets', planetsRouter);
api_v1.use('/launches', launchesRouter);

module.exports = api_v1;