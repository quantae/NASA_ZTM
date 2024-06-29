// We make use the js map feature.
const axios = require("axios");
const LAUNCHES_DATABASE = require("./launches.mongoSchema");
const planets = require("./planets.mongoSchema");
//const LAUNCHES_DATABASE = new Map();
// setting flight number

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

//let LatestFlightNumber = 100;

const DEFAULT_FLIGHT_NUMBER = 100;

// const launch = {
//   flightNumber: 100, // flight_number
//   mission: "string", //name
//   rocket: "string", //rocket.name
//   launchDate: new Date("March 31, 2030"), //date_local
//   target: "Kepler-296 A f", // no applicable
//   customer: ["ZTM", "NASA"], // payload.customers   for each payload
//   upcoming: true, // upcoming
//   success: true, // success
// };

// Invoke our save launch function.
// saveLaunch(launch);
// LAUNCHES_DATABASE.set(launch.flightNumber, launch);

// generic function to find an launch
async function findLaunch(filter) {
  return await LAUNCHES_DATABASE.findOne(filter);
}

//if launch exists.
async function existsLaunchWithId(launchId) {
  //return LAUNCHES_DATABASE.has(launchId);
  return await findLaunch({
    flightNumber: launchId,
  });
}

// Get all LAUNCHES_DATABASE
// function getAllLAUNCHES_DATABASE() {
//   return Array.from(LAUNCHES_DATABASE.values());
// }

/**
 *
 * Getting the latest flightNumber.
 * we query the DB to find the largest flightNumber then we can increment it to get the latest flight number.
 */
async function getLatestFlightNumber() {
  const latestLaunch = await LAUNCHES_DATABASE.findOne().sort("-flightNumber"); // the minus (-) sorts in descending order (higher to lowest)

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}


async function getAllLaunches(skip, limit) {
  return await LAUNCHES_DATABASE.find({}, { _id: 0, __v: 0 }) // this removes the _id and __v from the data.
  .sort({flightNumber: 1})// ascending values
  .skip(skip)
  .limit(limit)
}

//loadLAUNCHES_DATABASEData.
// With pagination using POST rather than GET
//

async function populateLaunches() {
  console.log("Downloading launch Data.. from spaceX api...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false, // this turns of pagination for the space x api
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data',);
    throw new Error ('Launch data download failed')
  }

  const launchDocs = response.data.docs;

  // create a for loop over each data of the launchDocs
  for (const launchDoc of launchDocs) {
    // we converting the response into a launch Object to be save
    // into our DB.
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    // TODO
   await saveLaunch(launch);
  }
 
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: "1",
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

   if (firstLaunch) {
     console.log("Launches data already loaded");
   } else {
   await populateLaunches();
   }
}

// Save new launch to MongoDB
async function saveLaunch(launch) {
  // we check if the added planet exists in the planet
  // collection.

  await LAUNCHES_DATABASE.findOneAndUpdate(
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

  const planet = await planets.findOne({
    // we check if the keplerName field matches
    // the value in the launch.target field in the
    // incoming launch data.
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No planets was found");
  }


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



// Adding LAUNCHES_DATABASE
// function addNewLaunch(launch) {
//   LatestFlightNumber += 1;
//   LAUNCHES_DATABASE.set(
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
  // const aborted = LAUNCHES_DATABASE.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;

  const aborted = await LAUNCHES_DATABASE.updateOne(
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

In LAUNCHES_DATABASE.model.js with the following:

return aborted.modifiedCount === 1;
   */

  // return aborted.ok === 1 && aborted.nModified === 1;
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  saveLaunch,

  scheduleNewLaunch,
  abortLaunchById,
};
