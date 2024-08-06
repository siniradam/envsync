#!/usr/bin/env node

// import { program } from "commander";
// import prompt from "prompt";
import config from "./utils/conf.js";

/**
 * If not logged in, prompt for login
 * If Loged in, list available env files
 * If env file is set, list available commands
 * 1. List Available ENVs
 * 2. Set Active Env: (New / Existing)
 */

import { signIn, login } from "./utils/auth.js";
import { displayEnvs, listEnvs } from "./utils/envs.js";

function init() {
  let token = config.get("token");

  try {
    if (!token) {
      console.log("Not Logged In");
      signIn().then(start);
    } else {
      // console.log("logging in");
      login(token).then(start);
    }
  } catch (error) {
    console.error(error);
    //
  }
}

async function start(pb) {
  if (pb) {
    const envs = await listEnvs(pb);

    await displayEnvs(envs);
  }
}

init();

process.on("exit", (msg) => {
  // Nothing is wrong, app closed itself.
  // console.log(msg);
});

process.on("uncaughtException", (msg, origin) => {
  if (`${msg.message}`.includes("force closed")) {
    console.log("> Goodbye");
  } else {
    console.log("> Something went wrong");
    console.error(msg);
  }
  //   // console.error(msg);
});

// process.on("unhandledRejection", (msg) => {
//   // If app is closed in the middle of something.
// });
