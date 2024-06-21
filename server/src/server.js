const https = require("https");
const fs = require("fs");
const path = require('path')

const app = require("./app");
const { mongoConnect } = require("./services/mongo");
const { loadPlanetData } = require("./models/planets.model");
const PORT = process.env.PORT || 8000;
// now we shall use https, thus, our node built in https would now be https
// also we shall not use the server below with only (app), but an this.(object, app)
// const server = https.createServer(app);

// Get the absolute paths for the key and certificate files
const keyPath = path.resolve(__dirname, "keys.pem");
const certPath = path.resolve(__dirname, "certs.pem");

// Print the current directory and paths
console.log("Current directory:", __dirname);
console.log("Key Path:", keyPath);
console.log("Cert Path:", certPath);

const server = https.createServer(
  {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  },
  app
);

async function startServer() {
  await mongoConnect();
  await loadPlanetData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
//...
