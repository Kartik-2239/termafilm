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
import {checkFile, checkFolder} from "./checkfile.js";

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


if (process.argv.length === 2) {
console.log(`
████████╗███████╗██████╗ ███╗   ███╗ █████╗     ███████╗██╗██╗     ███╗   ███╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗    ██╔════╝██║██║     ████╗ ████║
   ██║   █████╗  ██████╔╝██╔████╔██║███████║    █████╗  ██║██║     ██╔████╔██║
   ██║   ██╔══╝  ██╔██╔╝ ██║╚██╔╝██║██╔══██║    ██╔══╝  ██║██║     ██║╚██╔╝██║
   ██║   ███████╗██║  ██ ██║ ╚═╝ ██║██║  ██║    ██║     ██║███████╗██║ ╚═╝ ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝
      `)
}

if (argv.flags.getkey) {
  console.log("GROQ API key: ", (fs.readFileSync(configPath, "utf8").trim()).split("=")[1] || "");
  process.exit(0);
}
else if (argv.flags.setkey) {
  fs.writeFileSync(configPath, "GROQ_API_KEY=" + argv.flags.setkey.trim());
  process.exit(0);
}
else if (argv.flags.input && argv.flags.prompt && argv.flags.output) {

  if(checkFile(argv.flags.input) === false && checkFolder(argv.flags.input) === false){
    console.error(`${argv.flags.input} not found`);
    process.exit(1);
  }
  let generated_command = "";
  if (checkFile(argv.flags.input) === true){
    const video_data = await getVideoDetails(argv.flags.input);
    generated_command = await groqResponse(argv.flags.input, argv.flags.prompt + " video data: " + JSON.stringify(video_data), argv.flags.output);
    console.log("generated command: ", generated_command);  
  }
  else if (checkFolder(argv.flags.input) === true){
    const files = fs.readdirSync(argv.flags.input);
    const file_infos = []
    if (files.length === 1){
      console.error(`${argv.flags.input} is empty`);
      process.exit(1);
    }
    for (const file of files){
      const video_data = await getVideoDetails(path.join(argv.flags.input, file));
      file_infos.push({
        file: file,
        video_data: video_data
      });
    }
    const generated_commands = []
    for (const file_info of file_infos){
      const generated_command = await groqResponse(file_info.file, argv.flags.prompt + " video data: " + JSON.stringify(file_info.video_data), argv.flags.output);
      generated_commands.push(generated_command);
    }
    generated_command = generated_commands.join(" && ");
    console.log("generated command: ", generated_command);
  }
  rl.question("Execute command? (y/n)", async(answer) => {
    if (answer === "y") {
      try{
        await execute(generated_command, false);
      }catch(error){
        console.error(`Error: ${error}`);
        process.exit(3);
      }
    }
    rl.close();
    process.exit(0);
  });
}else {
  console.log("Usage: termafilm -i <input file> -p <prompt> -o <output file>");
  console.log("Use termafilm -h for help");
  process.exit(1);
}
