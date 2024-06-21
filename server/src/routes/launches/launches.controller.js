const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model");

async function httpGetAllLaunches(rep, res) {
  res.status(200).json(await getAllLaunches());
  // res.status(200).json(launches)
}

// Add New Launch
async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  //console.log(req.body)

  // validation.
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  // we modify the launch key on the launch
  // body and modify it into a date object.
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  await scheduleNewLaunch(launch);
  console.log('launch controller: ', launch)
  return res.status(201).json(launch);
}

// Abort Launch
async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchWithId(launchId)

  // if launch doesn't exist
  if (!existsLaunch)
    return res.status(404).json({
      error: "Launch not found",
    });

  // if launch does exist
  const aborted = await abortLaunchById(launchId);

  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    })
  }

  return res.status(200).json({ok: true});
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
