// We make use the js map feature.
const launches = require("./launches.mongoSchema");
const planets = require("./planets.mongoSchema");
//const launches = new Map();
// setting flight number

//let LatestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: "string",
  rocket: "string",
  launchDate: new Date("March 31, 2030"),
  target: "Kepler-296 A f",
  customer: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

// Invoke our save launch function.
//saveLaunch(launch);

// launches.set(launch.flightNumber, launch);

//if launch exists.
async function existsLaunchWithId(launchId) {
  //return launches.has(launchId);
  return await launches.findOne({
    flightNumber: launchId,
  });
}

// Get all launches
// function getAllLaunches() {
//   return Array.from(launches.values());
// }

/**
 *
 * Getting the latest flightNumber.
 * we query the DB to find the largest flightNumber then we can increment it to get the latest flight number.
 */
async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber"); // the minus (-) sorts in descending order (higher to lowest)

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  return await launches.find({}, { _id: 0, __v: 0 }); // this removes the _id and __v from the data.
}

// Save new launch to MongoDB
async function saveLaunch(launch) {
  // we check if the added planet exists in the planet
  // collection.
  const planet = await planets.findOne({
    // we check if the keplerName field matches
    // the value in the launch.target field in the
    // incoming launch data.
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No planets was found");
  }
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  console.log("launch", launch);
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ["Zero to Master", "NASA"],
    flightNumber: newFlightNumber,
  });
  console.log("new console", newLaunch);
  await saveLaunch(newLaunch);
  return saveLaunch;
}
// Adding launches
// function addNewLaunch(launch) {
//   LatestFlightNumber += 1;
//   launches.set(
//     LatestFlightNumber,
//     //object.assign is used to add
//     //additional properties to an object
//     // which did not exist before.
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customer: ["Zero to Master", "NASA"],
//       flightNumber: LatestFlightNumber,
//     })
//   );
// }

// Abort Launch
async function abortLaunchById(launchId) {
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;

  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  /**
   * latest version of Mongoose (version 6 and higher), the developers have improved the naming of some properties. Because of this, the updateOne function will now give us a different response. 

To ensure aborting a launch succeeds, we will need to replace:

return aborted.ok === 1 && aborted.nModified === 1;

In launches.model.js with the following:

return aborted.modifiedCount === 1;
   */

  // return aborted.ok === 1 && aborted.nModified === 1;
  return aborted.modifiedCount === 1;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  saveLaunch,

  scheduleNewLaunch,
  abortLaunchById,
};
