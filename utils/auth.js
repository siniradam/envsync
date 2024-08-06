import config from "./conf.js";
import pb from "./pb.js";
import { inProgress } from "./loading.js";

// CLI Tools
import input from "@inquirer/input";
import password from "@inquirer/password";
import chalk from "chalk";

// "logout" the last authenticated account
// pb.authStore.clear();

async function signIn() {
  const usermail = await input({ message: "Enter your username or email." });
  const pwd = await password({ message: "Enter your password." });

  const progress = inProgress("Signing In");
  //   const authData = await pb.collection("users").authWithPassword(usermail, "1234567890");
  try {
    const authData = await pb.admins
      .authWithPassword(usermail, pwd)
      .catch((e) => {
        // console.error(e);
        return e;
      })
      .finally(() => {
        progress.stop();
      });

    if (authData.status === 0) {
      let errCode = authData?.originalError?.cause?.code;
      if (errCode === "ERR_INVALID_URL") {
        return console.error(chalk.yellow("Your server address configuration is wrong."));
      }

      return console.log("Error", authData?.originalError?.cause);
    } else if (authData.status === 400) {
      return authFailed(usermail, pwd);
    } else if (authData.status) {
      console.log("status", authData.status);
      console.log(authData?.originalError?.cause);
    } else if (pb?.authStore?.isValid) {
      config.set("token", pb.authStore.token);
      console.log(pb.authStore.token);
      return pb;
    }
  } catch (error) {
    console.log(error);
  }

  return authFailed(usermail, pwd);

  // after the above you can also access the auth data from the authStore
  //   console.log(pb.authStore.isValid);
  //   console.log(pb.authStore.token);
  //   console.log(pb.authStore.model.id);

  //   // "logout" the last authenticated account
}

async function login(token) {
  pb.authStore.save(token);

  const auth = await pb.admins.authRefresh().catch((e) => e);
  if (auth.status) {
    // console.error(auth.response);
    // console.error(auth.code);
    // console.error(auth.status);
    // console.log(auth);
    console.log("Please sign in again.");
    logout();
    return null;
  }

  return pb;
}

async function logout() {
  config.delete("token");
  pb.authStore.clear();
}

function authFailed(usermail, pwd = "") {
  console.log(chalk.red("Wrong credentials.", usermail, pwd));
  return null;
}
// export functions
export { signIn, login };
