const { getAllPlanets } = require("../../models/planets.model");

async function httpGetAllPlanets(req, res) {
  return res.status(200).json(await getAllPlanets());
}

module.exports = {
  httpGetAllPlanets,
};

// Model >> access from controller >> access from router