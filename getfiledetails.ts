import { exec } from "child_process";

export default function getVideoDetails(filePath: string): Promise<{ duration: number; width: number; height: number; fps: number; codec_name: string }> {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`, (err, stdout, stderr) => {
      if (err) {
        return reject(err)
      }

      const info: FFProbeOutput = JSON.parse(stdout);
      const videoStream = info.streams.find((s: FFProbeStream) => s.codec_type === "video");

      if (!videoStream) {
        return reject()
      }

      resolve({
        duration: parseFloat(info.format.duration),
        codec_name: videoStream.codec_name!,
        width: videoStream.width!,
        height: videoStream.height!,
        fps: eval(videoStream.r_frame_rate!)
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
  