const localtunnel = require("localtunnel");

const PORT = 3001;
const SUBDOMAIN = "wasl-quran";

async function start() {
  try {
    const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });
    console.log(`Tunnel URL: ${tunnel.url}`);

    tunnel.on("close", () => {
      console.log("Tunnel closed, reconnecting...");
      setTimeout(start, 2000);
    });

    tunnel.on("error", (err) => {
      console.error(`Tunnel error: ${err.message}`);
    });
  } catch (err) {
    console.error(`Failed to open tunnel: ${err.message}, retrying...`);
    setTimeout(start, 2000);
  }
}

start();
