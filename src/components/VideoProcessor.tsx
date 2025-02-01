import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Clock, Upload, Settings, Play } from 'lucide-react';

const VideoProcessor = () => {
  const [subreddit, setSubreddit] = useState('');
  const [time1, setTime1] = useState('09:00');
  const [time2, setTime2] = useState('18:00');
  const [processing, setProcessing] = useState(false);

  const handleStartProcessing = () => {
    setProcessing(true);
    // TODO: Implement video processing logic
    setTimeout(() => setProcessing(false), 2000); // Temporary simulation
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto bg-card p-8 shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Reddit Video Automation</h1>
        
        <div className="space-y-6">
          {/* Subreddit Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subreddit</label>
            <Input
              placeholder="Enter subreddit name"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="bg-background"
            />
          </div>

          {/* Posting Times */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex gap-4">
              <Input
                type="file"
                accept="video/*"
                className="bg-background"
              />
            </div>
          </div>

          {/* Settings & Actions */}
          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </Button>
            <Button 
              onClick={handleStartProcessing}
              disabled={processing}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {processing ? 'Processing...' : 'Start Processing'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoProcessor;