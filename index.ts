#!/usr/bin/env node

import fs from "fs";
import groqResponse from "./groq.js";
import { cli } from "cleye";
import readline from "readline";
import execute from "./execute.js";
import getMediaDetails from "./getfiledetails.js";
import os from "os";
import path from "path";
import { checkFile, checkFolder } from "./checkfile.js";

const configPath = path.join(os.homedir(), ".termafilm");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const argv = cli({
  name: 'termafilm',
  flags: {
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
    },
    help: {
      type: Boolean,
      description: 'Show help',
      alias: 'h',
    },
  },
});

function banner() {
  console.log(`
███████╗███████╗██████╗ ███╗   ███╗ █████╗     ███████╗██╗██╗     ███╗   ███╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗    ██╔════╝██║██║     ████╗ ████║
   ██║   █████╗  ██████╔╝██╔████╔██║███████║    █████╗  ██║██║     ██╔████╔██║
   ██║   ██╔══╝  ██╔██╔╝ ██║╚██╔╝██║██╔══██║    ██╔══╝  ██║██║     ██║╚██╔╝██║
   ██║   ███████╗██║  ██ ██║ ╚═╝ ██║██║  ██║    ██║     ██║███████╗██║ ╚═╝ ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝
  `);
}

function help() {
  console.log(`Usage: termafilm [options]

Options:
  -i, --input <file>    Input video file or folder
  -p, --prompt <text>   Prompt for the video
  -o, --output <file>   Output file
  -k, --setkey <key>    Set GROQ API key
  -g, --getkey          Get current API key
  -h, --help            Show this help message

Example:
  termafilm -i video.mp4 -p "increase bitrate of the video" -o output.mp4
  termafilm -i videos/ -p "increase bitrate of the video" -o output_videos/
`);
}

async function getKey() {
  const key = fs.readFileSync(configPath, "utf8").trim().split("=")[1] || "";
  console.log(`GROQ API key: ${key}`);
  process.exit(0);
}

function setKey(key: string) {
  fs.writeFileSync(configPath, `GROQ_API_KEY=${key.trim()}`);
  console.log("API key saved successfully");
  process.exit(0);
}

async function processVideo(input: string, output: string, prompt: string) {
  if (!checkFile(input) && !checkFolder(input)) {
    console.error(`Error: "${input}" not found`);
    process.exit(1);
  }

  let generatedCommand = "";

  if (checkFile(input)) {
    const videoData = await getMediaDetails(input);
    generatedCommand = await groqResponse(
      input,
      `${prompt} media data: ${JSON.stringify(videoData)}`,
      output
    );
  } else if (checkFolder(input)) {
    const files = fs.readdirSync(input);
    if (files.length === 0) {
      console.error(`Error: "${input}" is empty`);
      process.exit(1);
    }

    const fileInfos = [];
    for (const file of files) {
      const videoData = await getMediaDetails(path.join(input, file));
      fileInfos.push({ path: path.join(input, file), videoData });
    }

    const commands = [];
    for (const info of fileInfos) {
      const cmd = await groqResponse(
        info.path,
        `${prompt} media data: ${JSON.stringify(info.videoData)}`,
        output + "/" + info.path.split("/").pop()
      );
      commands.push(cmd);
    }
    generatedCommand = commands.join(" && ");
  }

  console.log(`Generated command: ${generatedCommand}`);

  rl.question("Execute command? (y/n) ", async (answer) => {
    rl.close();
    if (answer.toLowerCase() === "y") {
      if (!checkFolder(output) && output.split(".").length === 1) {
        fs.mkdirSync(output, { recursive: true });
      }
      try {
        await execute(generatedCommand, false);
      } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(3);
      }
    }
    process.exit(0);
  });
}

if (process.argv.length === 2) {
  banner();
  help();
  process.exit(0);
}

if (argv.flags.help) {
  help();
  process.exit(0);
}

if (argv.flags.getkey) {
  getKey();
} else if (argv.flags.setkey) {
  setKey(argv.flags.setkey);
} else if (argv.flags.input && argv.flags.prompt && argv.flags.output) {
  processVideo(argv.flags.input, argv.flags.output, argv.flags.prompt);
} else {
  help();
  process.exit(1);
}
