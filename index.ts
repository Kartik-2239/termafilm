#!/usr/bin/env node

import fs from "fs";
// import generateCmd from "./generate.js";
import groqResponse from "./groq.js";
import { cli, command } from "cleye";
import readline from "readline";
import execute from "./execute.js";

import os from "os";
import path from "path";

const configPath = path.join(os.homedir(), ".termafilm");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const argv = cli({
  name: 'termafilm',

  // Define parameters
  // parameters: [
  //     '<first name>', // First name is required
  //     '[last name]' // Last name is optional
  // ],
  flags: {
    // rm_key: {
    //   type: Boolean,
    //   description: 'Remove the OpenAI API key',
    //   alias: 'r',
    // },
    get_key: {
      type: Boolean,
      description: 'Get the OpenAI API key',
      alias: 'g',
    },
    set_key: {
      type: String,
      description: 'Set the OpenAI API key',
      alias: 'k',
    },
      quiet: {
        type: Boolean,
        description: 'Doesn\'t show output',
        alias: 'q',
      },
      yes: {
        type: Boolean,
        description: 'Execute the command without asking',
        alias: 'y',
      },
      input: {
        type: String,
        description: 'Input file',
        alias: 'i',
      },
      prompt: {
        type: String,
        description: 'Prompt',
        alias: 'p',
      },
      output: {
        type: String,
        description: 'Output file (optional)',
        alias: 'o',
      }
  },
})

if (argv.flags.get_key) {
  console.log("API key: ", fs.readFileSync(configPath, "utf8").trim());
  process.exit(0);
}
else if (argv.flags.set_key) {
  fs.writeFileSync(configPath, argv.flags.set_key.trim());
  process.exit(0);
}
else if (typeof argv.flags.input === "string"&& argv.flags.input.trim() !== "" && typeof argv.flags.prompt === "string" && argv.flags.prompt.trim() !== "") {
  const generated_command = await groqResponse(argv.flags.input, argv.flags.prompt, argv.flags.output || "");
  console.log("generated command: ", generated_command);

  if (argv.flags.yes) {
    try{
      await execute(generated_command, argv.flags.quiet || false);
      process.exit(0);
    }catch(error){
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  }else{
  rl.question("Execute command? (y/n)", async(answer) => {
    if (answer === "y") {
      // console.log("Executing command...");
      if (argv.flags.quiet) {
        try{
          (async () => {
            await execute(generated_command, true);
          })();
        }catch(error){
          console.error(`Error: ${error}`);
          console.log("set key with: termafilm -k <key>");
          process.exit(1);
        }
      } else {
        try{
          await execute(generated_command, false);
        }catch(error){
          console.error(`Error: ${error}`);
          process.exit(1);
        }
      }
    }
    rl.close();
    process.exit(0);
  });
}
  // console.log(argv.flags.input, argv.flags.prompt, argv.flags.output);
}else {
  console.log("Usage: termafilm -i <input file> -p <prompt> -o <output file>");
  process.exit(1);
}
