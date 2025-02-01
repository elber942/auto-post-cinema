import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Builder, By, until } from 'selenium-webdriver';
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
  private driver: any;
  
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

  private async initSelenium() {
    this.driver = await new Builder().forBrowser('chrome').build();
  }

  private async captureRedditPosts(subreddit: string, count: number = 14): Promise<string[]> {
    try {
      await this.initSelenium();
      await this.driver.get(`https://reddit.com/r/${subreddit}/top`);
      await this.driver.wait(until.elementLocated(By.css('.Post')), 10000);
      
      const posts = await this.driver.findElements(By.css('.Post'));
      const screenshots: string[] = [];
      
      for (let i = 0; i < Math.min(count, posts.length); i++) {
        const screenshot = await posts[i].takeScreenshot();
        screenshots.push(screenshot);
      }
      
      return screenshots;
    } catch (error) {
      console.error('Reddit scraping error:', error);
      throw new Error('Failed to capture Reddit posts');
    } finally {
      if (this.driver) {
        await this.driver.quit();
      }
    }
  }

  private async processVideo(
    screenshot: string,
    backgroundVideo: File,
    watermark?: string
  ): Promise<Blob> {
    try {
      const videoData = await fetchFile(backgroundVideo);
      const screenshotData = await fetchFile(screenshot);
      
      // Write input files
      await this.ffmpeg.writeFile('input.mp4', videoData);
      await this.ffmpeg.writeFile('screenshot.png', screenshotData);
      
      // Overlay screenshot on top half of video
      const command = [
        '-i', 'input.mp4',
        '-i', 'screenshot.png',
        '-filter_complex',
        `[1:v]scale=1080:960[top];[0:v]scale=1080:960[bottom];[top][bottom]vstack,format=yuv420p${
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
      const screenshots = await this.captureRedditPosts(config.subreddit);
      
      for (let i = 0; i < screenshots.length; i++) {
        const video = await this.processVideo(
          screenshots[i],
          config.backgroundVideo,
          config.watermark
        );
        
        // Save the video
        const url = URL.createObjectURL(video);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reddit_video_${i + 1}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Wait 1 minute between processing
        if (i < screenshots.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
      
      toast({
        title: "Success",
        description: "All videos have been processed and saved",
      });
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate videos",
        variant: "destructive"
      });
    }
  }
}

export const videoProcessor = new VideoProcessor();