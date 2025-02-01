import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Clock, Upload, Settings, Play } from 'lucide-react';
import { videoProcessor } from '@/utils/videoProcessor';

const VideoProcessor = () => {
  const { toast } = useToast();
  const [subreddit, setSubreddit] = useState('');
  const [time1, setTime1] = useState('09:00');
  const [time2, setTime2] = useState('18:00');
  const [processing, setProcessing] = useState(false);
  const [watermark, setWatermark] = useState('');
  const [backgroundVideo, setBackgroundVideo] = useState<File | null>(null);

  const handleStartProcessing = async () => {
    if (!subreddit || !backgroundVideo) {
      toast({
        title: "Missing Information",
        description: "Please provide both a subreddit and background video.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    toast({
      title: "Processing Started",
      description: "Generating 14 videos. This may take a while...",
    });

    try {
      await videoProcessor.generateVideos({
        subreddit,
        backgroundVideo,
        watermark,
        time1,
        time2
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process videos",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBackgroundVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundVideo(file);
      toast({
        title: "Video Selected",
        description: file.name,
      });
    }
  };

  // Schedule video generation
  React.useEffect(() => {
    const scheduleVideos = () => {
      const now = new Date();
      const [hours1, minutes1] = time1.split(':').map(Number);
      const [hours2, minutes2] = time2.split(':').map(Number);
      
      const schedule1 = new Date(now);
      schedule1.setHours(hours1, minutes1, 0);
      
      const schedule2 = new Date(now);
      schedule2.setHours(hours2, minutes2, 0);
      
      if (schedule1 < now) schedule1.setDate(schedule1.getDate() + 1);
      if (schedule2 < now) schedule2.setDate(schedule2.getDate() + 1);
      
      const timeout1 = schedule1.getTime() - now.getTime();
      const timeout2 = schedule2.getTime() - now.getTime();
      
      const timer1 = setTimeout(() => {
        if (subreddit && backgroundVideo) handleStartProcessing();
      }, timeout1);
      
      const timer2 = setTimeout(() => {
        if (subreddit && backgroundVideo) handleStartProcessing();
      }, timeout2);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    };
    
    return scheduleVideos();
  }, [time1, time2, subreddit, backgroundVideo]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-4xl mx-auto bg-card p-6 md:p-8 shadow-xl rounded-xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reddit Video Automation</h1>
            <p className="text-sm text-muted-foreground">Generate YouTube Shorts from Reddit posts</p>
          </div>
          
          <div className="space-y-6">
            {/* Subreddit Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subreddit</label>
              <Input
                placeholder="Enter subreddit name (without r/)"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Posting Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> First Posting Time
                </label>
                <Input
                  type="time"
                  value={time1}
                  onChange={(e) => setTime1(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Second Posting Time
                </label>
                <Input
                  type="time"
                  value={time2}
                  onChange={(e) => setTime2(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {/* Background Video Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4" /> Background Video
              </label>
              <Input
                type="file"
                accept="video/*"
                onChange={handleBackgroundVideoChange}
                className="bg-background"
              />
              {backgroundVideo && (
                <p className="text-sm text-muted-foreground">
                  Selected: {backgroundVideo.name}
                </p>
              )}
            </div>

            {/* Watermark Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Watermark (Optional)</label>
              <Input
                placeholder="Enter watermark text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Video Layout Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Video Layout Preview</label>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="aspect-[9/16] bg-accent/10 rounded-lg flex flex-col">
                  <div className="h-1/2 border-b border-border flex items-center justify-center text-sm text-muted-foreground">
                    Reddit Post
                  </div>
                  <div className="h-1/2 flex items-center justify-center text-sm text-muted-foreground">
                    Background Video
                  </div>
                  {watermark && (
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                      {watermark}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">
              <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
                <Settings className="w-4 h-4" /> Advanced Settings
              </Button>
              <Button 
                onClick={handleStartProcessing}
                disabled={processing}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Processing
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoProcessor;