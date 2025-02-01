import React from 'react';

interface VideoPreviewProps {
  watermark?: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ watermark }) => {
  return (
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
  );
};