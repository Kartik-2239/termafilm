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
```

Auto‑execute without prompt:

```bash
termafilm -i clip.mov -p "Resize to 1920x1080 at 30 fps" -o clip_1080p.mp4 -y
```

Quiet execution (suppress ffmpeg stdout/stderr):

```bash
termafilm -i input.mp4 -p "Trim first 10 seconds" -o trimmed.mp4 -y -q
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
- `-y, --yes`       Execute without interactive confirmation
- `-q, --quiet`     Suppress ffmpeg output while running
- `-k, --setkey`    Save Groq API key to `~/.termafilm`
- `-g, --getkey`    Print the saved key




