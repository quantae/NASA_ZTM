// const planets = ['planets'];
// module.exports = planets;

const path = require("path");
const { parse } = require("csv-parse");
const fs = require("fs");
const planets = require('./planets.mongoSchema')

// results to store the chunk data
const results = [];
const habitablePlanets = [];

// function to filter out only plants that are habitable.
function isHabitablePlanets(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

/**
 * const promise = new Promise(() => {resolve, reject
 *  resolve(42)
 *  });
 * promise.then((result) => {
 *
 * })
 * const result = await promise;
 */

function loadPlanetData() {
  // fs read stream
  // The pipe takes a readable stream data to a destination of
  // writable stream data.
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data/", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanets(data)) {
          // we now store the habitable planets in mongoDB
          // rather the in memory array. 
          //habitablePlanets.push(data);
        savePlanet(data)
        }
        results.push(data);
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        // get all the planets from the DB instead of 
        // habitablePlanets Array. 
        const countPlanetsFound = (await getAllPlanets()).length;
        const planetsFound = await getAllPlanets();
        console.log(`${results.length} : Total number of planets`);
        console.log(`${countPlanetsFound} habitable planets found`);
        console.log(
          planetsFound.map((planet, index) => {
            return `${index} ${planet["keplerName"]}`;
          })
        );
        console.log("done with data");
        resolve();

      });
  });
}

async function getAllPlanets() {
  // first arg of empty empty object
  // returns all documents in the object. 

  // second arg is specify which keys to exclude 
  // from the returned object. 
  return await planets.find({}, {
    "_id": 1, "__v": 0,
  });
}

async function savePlanet(planet) {
 try {
  await planets.updateOne({
    keplerName: planet.kepler_name
  }, {
    keplerName: planet.kepler_name,
  }, {
    upsert: true,
  })
 } catch (err) {
  console.error(`Could not save planet ${err} `)
 }
}


module.exports = {
    loadPlanetData,
  getAllPlanets
};
