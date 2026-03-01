# TermaFilm

Terafilm is a cli tool for editing videos with natural language.

It uses groq for generating ffmpeg commands.

## Prerequisites
- **Node.js** 18+
- **ffmpeg** and **ffprobe** available on your PATH
- **Groq API key** (stored locally)

## Install

Global (from npm):

```bash
npm i -g termafilm
```

From source (this repo):

```bash
npm install
npm run build
npm link
```

## Configure your Groq API key

Set once (writes to `~/.termafilm`):

```bash
termafilm -k YOUR_GROQ_API_KEY
```

Check what is stored:

```bash
termafilm -g
```

## Usage

Basic flow (approve before running):

```bash
termafilm -i input.mp4 -p "Extract audio to mp3" -o output.mp3
termafilm -i folder/ -p "Extract audio to mp3" -o output/
```

If any required flag is missing, TermaFilm prints:

```
Usage: termafilm -i <input file> -p <prompt> -o <output file>
Use termafilm -h for help
```

## CLI flags
- `-i, --input`     Input file path (required)
- `-p, --prompt`    Natural‑language request (required)
- `-o, --output`    Output file path (required and must NOT already exist)
- `-k, --setkey`    Save Groq API key to `~/.termafilm`
- `-g, --getkey`    Print the saved key




