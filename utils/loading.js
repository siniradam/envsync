import cliSpinners from "cli-spinners";
import ora from "ora";

// console.log(cliSpinners.dots, "Signing In");

function inProgress(msg) {
  return ora(msg).start();
}

export { inProgress };
