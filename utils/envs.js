// const answer = await confirm({ message: "Continue?" });

import confirm from "@inquirer/confirm";
import input from "@inquirer/input";
import { select, Separator } from "@inquirer/prompts";
import fileSelector from "inquirer-file-selector";

import fs from "fs";

async function listEnvs(pb) {
  return pb.collection("envs").getList();
}

async function displayEnvs(envs) {
  if (envs.totalItems === 0) {
    const answer = await confirm({
      message: "There are no env records. Would you like to create one?",
    });
    console.log(answer);
    if (answer) {
      typeCurrentEnv();
    }
  } else {
    const envFiles = parseEnvList(envs);

    // Create a list of choices
    const choices = Object.keys(envFiles).map((env) => {
      return {
        name: env,
        value: env,
        description: `Contains ${envFiles[env].length} key(s)`,
      };
    });

    function fileNameRegexCheck(fileName) {
      return fileName.match(/\.env(\.\w+)?/);
    }

    // Add a separator
    choices.push(new Separator());

    // Add a pick file option
    choices.push({
      name: "Pick a local file",
      value: "pick",
      description: "Pick a local file to work with",
    });

    // Initial selection
    const envFileName = await select({
      message: "Select an env file to work with",
      choices,
    });

    if (envFileName === "pick") {
      // If the user selects a file

      const filePath = await fileSelector({
        message: "Select a file:",
        extensions: [".env"],
      });

      console.log(filePath);
    } else {
      // If the user selects an env file

      let envFile = envFiles[envFileName];
      await showEnvOptions(envFileName, envFile);
    }
  }

  async function typeCurrentEnv() {
    let envName = await input({
      message: "Type your env name. Without `.env`",
    });
    envName = `.env${envName ? "." + envName : ""}`;
    await envMethods(envName);
  }

  async function showEnvOptions(envFileName, envFile, callback) {
    const action = await envMethods(envFileName);

    switch (action) {
      case "add":
        addEnvValue(envFile, (updatedEnvFile) =>
          showEnvOptions(envFileName, updatedEnvFile)
        );
        break;
      case "pull":
        pullEnv(envFileName, envFile, (updatedEnvFile) =>
          showEnvOptions(envFileName, updatedEnvFile)
        );
        break;
      case "push":
        pushEnv(envFileName, envFile, (updatedEnvFile) =>
          showEnvOptions(envFileName, updatedEnvFile)
        );
        break;
      case "list":
        listEnvValues(envFile, (updatedEnvFile) =>
          showEnvOptions(envFileName, updatedEnvFile)
        );
        break;
      case "<exit>":
        process.exit(0);
        break;
    }
  }
}

async function envMethods(envName) {
  return select({
    message: `Choose an option for ${envName}`,
    choices: [
      {
        name: "Add Value",
        value: "add",
        description: "Add a definition to the current ENV",
      },
      {
        name: "Pull",
        value: "pull",
        description:
          "Pulls all ENV values and saves as a file. (Warning: If file is already exists it may overwrite!)",
      },
      {
        name: "Push",
        value: "push",
        description:
          "If exists, pushes your local file to the server. It will create new ones, and update the old ones.",
      },
      {
        name: "List",
        value: "list",
        description: "Lists all ENV values.",
      },
      new Separator(),
      {
        name: "Exit",
        value: "<exit>",
        description: "Exit the program. (Unsaved changes will be lost!)",
      },
    ],
  });
}

async function readLocalEnvFile(filename) {
  return fs.openSync(filename);
}

function parseEnvList(envs) {
  const envFiles = {};
  envs.items.forEach((env) => {
    if (!envFiles[env.file]) {
      envFiles[env.file] = [];
    }
    envFiles[env.file].push({
      name: env.name,
      value: env.value,
      created: env.created,
      updated: env.updated,
    });
  });
  return envFiles;
}

function parseEnvFile(fileContent) {
  //Split line
  // and covert to an object.
}

async function pushEnv(envFileName, envFile, callback) {}

async function pullEnv(envFileName, envFile, callback) {
  const envValues = envFile.map((env) => `${env.name}=${env.value}`).join("\n");

  const fileName = `.env.${envFileName}`;
  try {
    fs.writeFileSync(fileName, envValues);
    console.log(`\n--- File ${fileName} has been saved. ---\n`);
  } catch (error) {
    console.error(error);
  }

  return callback(envFile);
}

async function addEnvValue(envFile, callback) {
  const envName = await input({
    message: "Type your env name",
  });

  const envValue = await input({
    message: "Type your env value",
  });

  envFile.push({ name: envName, value: envValue });

  const answer = await confirm({
    message: "Would you like to add another value?",
  });

  if (answer) {
    return addEnvValue(envFile, callback);
  }

  return callback(envFile);
}

async function listEnvValues(envFile, callback) {
  const choices = envFile.map((env) => {
    return {
      name: env.name,
      value: env.name,
      description: env.value,
    };
  });

  choices.push(new Separator());
  choices.push({
    name: "Go Back",
    value: "<back>",
    description: "Go back to the previous menu",
  });

  const envItemName = await select({
    message: "Env values",
    choices,
  });

  if (envItemName === "<back>") {
    return callback(envFile);
  }

  const selectedEnv = envFile.find((env) => env.name === envItemName);

  const action = await select({
    message: `Choose an option for ${selectedEnv.name}`,
    choices: [
      {
        name: "Edit",
        value: "edit",
        description: "Edit the value",
      },
      {
        name: "Delete",
        value: "delete",
        description: "Delete the value",
      },
      new Separator(),
      {
        name: "Go Back",
        value: "<back>",
        description: "Go back to the previous menu",
      },
    ],
  });

  switch (action) {
    case "edit":
      const newValue = await input({
        message: `Type new value for ${selectedEnv.name}`,
      });
      selectedEnv.value = newValue;
      break;
    case "delete":
      const answer = await confirm({
        message: `Are you sure you want to delete ${selectedEnv.name}?`,
      });
      if (answer) {
        envFile = envFile.filter((env) => env.name !== selectedEnv.name);
      }
      break;
  }

  return callback(envFile);
}

export { listEnvs, displayEnvs };

// Temporary Ref code.
//   return pb.collection("envs").getList(1, 20, {
// filter: 'status = true && created > "2022-08-01 10:00:00"',
//   });
