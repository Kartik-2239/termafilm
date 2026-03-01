import { exec } from "child_process";
import * as fs from "fs";

export default function getMediaDetails(filePath: string): Promise<{ duration: number; width: number; height: number; fps: number; codec_name: string }> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: "${filePath}". Please check that the file exists and the path is correct.`));
    }

    exec(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`Failed to read media file "${filePath}". Make sure it's a valid media file and FFmpeg can read it.\n\nOriginal error: ${err.message}`))
      }

      const info: FFProbeOutput = JSON.parse(stdout);
      const videoStream = info.streams.find((s: FFProbeStream) => s.codec_type === "video");
      const audioStream = info.streams.find((s: FFProbeStream) => s.codec_type === "audio");

      if (!videoStream && !audioStream) {
        return reject(new Error(`No video or audio stream found in "${filePath}". Make sure it's a valid media file.`))
      }

      resolve({
        duration: parseFloat(info.format.duration),
        codec_name: videoStream?.codec_name || audioStream?.codec_name || "unknown",
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        fps: videoStream ? eval(videoStream.r_frame_rate!) : 0
      });
    });
  });
}



interface FFProbeStream {
    codec_type: string; 
    codec_name: string;
    width?: number;     
    height?: number;    
    r_frame_rate?: string; 
    [key: string]: any;  
  }
  
  interface FFProbeFormat {
    duration: string;
    [key: string]: any;
  }
  
  interface FFProbeOutput {
    streams: FFProbeStream[];
    format: FFProbeFormat;
  }
