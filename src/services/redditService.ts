const REDDIT_BASE_URL = 'https://www.reddit.com';

export interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  author: string;
  score: number;
  is_video: boolean;
  media?: {
    reddit_video?: {
      fallback_url: string;
    };
  };
}

export const fetchRedditPosts = async (subreddit: string, limit: number = 14): Promise<RedditPost[]> => {
  // For testing, return a sample post
  if (subreddit === 'test') {
    return [{
      title: 'Test Post',
      selftext: 'This is a test post',
      url: 'https://picsum.photos/1080/1920', // Random test image from Lorem Picsum
      permalink: '/r/test/test_post',
      author: 'testuser',
      score: 100,
      is_video: false
    }];
  }

  try {
    const response = await fetch(
      `${REDDIT_BASE_URL}/r/${subreddit}/top.json?limit=${limit}&t=day`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Reddit posts');
    }

    const data = await response.json();
    return data.data.children.map((child: any) => child.data);
  } catch (error) {
    console.error('Reddit API error:', error);
    throw error;
  }
};

export const downloadImage = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to download image');
  return await response.blob().then(blob => blob.arrayBuffer());
};