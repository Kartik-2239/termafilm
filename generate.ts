import OpenAI from 'openai';
import { APIError } from 'openai';
import fs from 'fs';
import os from 'os';
import path from 'path';

const configPath = path.join(os.homedir(), ".termafilm");

let apiKey = "";
if (fs.existsSync(configPath)) {
  apiKey = fs.readFileSync(configPath, "utf8").trim();
}
const client = new OpenAI({
    apiKey: apiKey,
});


function prompt(file: string, prompt: string, outputFile: string): string{
    return `You are one of the wizards who knows everything about ffmpeg.
            Generate an ffmpeg command for satisfying the user's prompt.
            user prompt: "${prompt}", with the input file: "${file}" and the output file: "${outputFile}".
            a child might be injured if you don't give good results.
            Give just the exact command, no other text or comments.
            bye default use mp3 for audio and mp4 for video unless specified by the user in the prompt or the output file.`;
}


async function generateCmd(file: string, userPrompt: string, outputFile: string) {
    try {
    const response = await client.responses.create({
        model: "gpt-5-mini",
        input: prompt(file, userPrompt, outputFile)
        });
        return response.output_text;
    } catch (error) {
        return (error as APIError).code as string
    }
}


export default generateCmd;

// generateCmd("input.mp4", "Generate a video from the input file", "output.mp4");  