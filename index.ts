#!/usr/bin/env node

import fs from "fs";
// import generateCmd from "./generate.js";
import groqResponse from "./groq.js";
import { cli } from "cleye";
import readline from "readline";
import execute from "./execute.js";
import getVideoDetails from "./getfiledetails.js";

import os from "os";
import path from "path";
import checkFile from "./checkfile.js";

const configPath = path.join(os.homedir(), ".termafilm");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});  

const argv = cli({
  name: 'termafilm',
  flags: {
    // rm_key: {
    //   type: Boolean,
    //   description: 'Remove the OpenAI API key',
    //   alias: 'r',
    // },
    getkey: {
      type: Boolean,
      description: 'Get the API key',
      alias: 'g',
    },
    setkey: {
      type: String,
      description: 'Set the API key',
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

if (argv.flags.getkey) {
  console.log("GROQ API key: ", (fs.readFileSync(configPath, "utf8").trim()).split("=")[1] || "");
  process.exit(0);
}
else if (argv.flags.setkey) {
  fs.writeFileSync(configPath, "GROQ_API_KEY=" + argv.flags.setkey.trim());
  process.exit(0);
}
// else if (typeof argv.flags.input === "string" && argv.flags.input.trim() !== "" && typeof argv.flags.prompt === "string" && argv.flags.prompt.trim() !== "")
else if (argv.flags.input && argv.flags.prompt && argv.flags.output) {

  if(checkFile(argv.flags.input) === false){
    console.error("input file not found");
    process.exit(1);
  }
  if(checkFile(argv.flags.output) === true){
    console.error("Output file already exists");
    process.exit(1);
  }

  const video_data = await getVideoDetails(argv.flags.input);
  console.log("video data: ", video_data);
  const generated_command = await groqResponse(argv.flags.input, argv.flags.prompt + " video data: " + JSON.stringify(video_data), argv.flags.output);
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
          process.exit(0);
        }catch(error){
          console.error(`Error: ${error}`);
          console.log("set key with: termafilm -k <key>");
          process.exit(2);
        }
      } else {
        try{
          await execute(generated_command, false);
        }catch(error){
          console.error(`Error: ${error}`);
          process.exit(3);
        }
      }
    }
    rl.close();
    process.exit(0);
  });
}
}else {
  console.log("Usage: termafilm -i <input file> -p <prompt> -o <output file>");
  console.log("Use termafilm -h for help");
  process.exit(1);
}
