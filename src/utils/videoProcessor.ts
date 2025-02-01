import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from '@/hooks/use-toast';

export interface VideoConfig {
  subreddit: string;
  backgroundVideo: File;
  watermark?: string;
  time1: string;
  time2: string;
}

class VideoProcessor {
  private ffmpeg: FFmpeg;
  
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.initFFmpeg();
  }

  private async initFFmpeg() {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log('FFmpeg loaded');
    } catch (error) {
      console.error('FFmpeg load error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize video processor",
        variant: "destructive"
      });
    }
  }

  private async processVideo(
    backgroundVideo: File,
    watermark?: string
  ): Promise<Blob> {
    try {
      const videoData = await fetchFile(backgroundVideo);
      
      // Write input file
      await this.ffmpeg.writeFile('input.mp4', videoData);
      
      // Process video with watermark if provided
      const command = [
        '-i', 'input.mp4',
        '-filter_complex',
        `format=yuv420p${
          watermark ? `,drawtext=text='${watermark}':x=10:y=h-th-10:fontsize=24:fontcolor=white` : ''
        }`,
        '-t', '5',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        'output.mp4'
      ];
      
      await this.ffmpeg.exec(command);
      
      const data = await this.ffmpeg.readFile('output.mp4');
      return new Blob([data], { type: 'video/mp4' });
    } catch (error) {
      console.error('Video processing error:', error);
      throw new Error('Failed to process video');
    }
  }

  public async generateVideos(config: VideoConfig): Promise<void> {
    try {
      // For now, just process one video as a placeholder
      // This will be replaced with actual Reddit content processing later
      const video = await this.processVideo(
        config.backgroundVideo,
        config.watermark
      );
      
      // Save the video
      const url = URL.createObjectURL(video);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_video.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Video has been processed and saved",
      });
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate video",
        variant: "destructive"
      });
    }
  }
}

export const videoProcessor = new VideoProcessor();
