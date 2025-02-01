import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from '@/hooks/use-toast';
import { RedditPost, downloadImage } from '@/services/redditService';

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
    redditPost: RedditPost,
    backgroundVideo: File,
    watermark?: string
  ): Promise<Blob> {
    try {
      // Write input files
      const videoData = await fetchFile(backgroundVideo);
      await this.ffmpeg.writeFile('background.mp4', videoData);

      // Download and write the Reddit post image
      const imageData = await downloadImage(redditPost.url);
      await this.ffmpeg.writeFile('reddit_post.jpg', new Uint8Array(imageData));

      // Process video with Reddit post overlay and optional watermark
      const command = [
        '-i', 'background.mp4',
        '-i', 'reddit_post.jpg',
        '-filter_complex',
        `[1:v]scale=1080:960[top];[0:v]scale=1080:960[bottom];[top][bottom]vstack${
          watermark ? `,drawtext=text='${watermark}':x=10:y=h-th-10:fontsize=24:fontcolor=white` : ''
        }`,
        '-t', '60',
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

  public async generateVideo(
    redditPost: RedditPost,
    backgroundVideo: File,
    watermark?: string
  ): Promise<Blob> {
    return await this.processVideo(redditPost, backgroundVideo, watermark);
  }
}

export const videoProcessor = new VideoProcessor();