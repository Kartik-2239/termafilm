import Groq from "groq-sdk";
import { APIError } from "groq-sdk";
import { GroqError } from "groq-sdk"
import fs from "fs";
import os from "os";
import path from "path";

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = path.join(os.homedir(), ".termafilm");

const errors = {
    400: "BadRequestError",
    401: "AuthenticationError", 
    403: "PermissionDeniedError",
    404: "NotFoundError",
    422: "UnprocessableEntityError",
    429: "RateLimitError",
    500: "InternalServerError"
};


let apiKey = "";
if (fs.existsSync(configPath)) {
  apiKey = (fs.readFileSync(configPath, "utf8").trim()).split("=")[1] || "";
}

// const ffmpeg_doc = fs.readFileSync(join(__dirname, "prompt.txt"), "utf8");

function prompt(file: string, prompt: string, outputFile: string): string{
    return `You are one of the wizards who knows everything about ffmpeg.
            Generate an ffmpeg command for satisfying the user's prompt.
            user request: "${prompt}", with the input file: "${file}" and the output file: "${outputFile}".
            Give just the exact command, no other text or comments.

            - Use the same extension as the input unless the user specifies otherwise.
            - Ensure the chosen codecs are valid for the chosen container.
            - The command must be syntactically valid in ffmpeg (no undefined variables).
            - Output only the command, nothing else.
            `;
}

const groq = new Groq({ apiKey: apiKey });



export async function getGroqChatCompletion(file: string, userPrompt: string, outputFile: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt(file, userPrompt, outputFile),
      },
    ],
    model: "openai/gpt-oss-120b",
  });
}


export default async function groqResponse(file: string, prompt: string, outputFile: string) {
    try{
        const chatCompletion = await getGroqChatCompletion(file, prompt, outputFile);
        // Print the completion returned by the LLM.
        return chatCompletion.choices[0]?.message?.content || "";
    }catch(error){
        if (error instanceof APIError && error.status in errors){
            console.error(`${error.status}: ${(errors[error.status as keyof typeof errors])}`);
            console.error("try termafilm -h for help");
        }else{
            console.error(`Error: ${error}`);
        }
        process.exit(1);
    }
  }
