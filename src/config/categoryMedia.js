export const CATEGORY_MEDIA = {
  fruit: {
    video: 'https://videos.pexels.com/video-files/5527799/5527799-uhd_2160_3840_24fps.mp4',
    poster: 'https://images.pexels.com/videos/26690092/backlighting-flower-fruits-fruitage-fruits-26690092.jpeg',
  },
  vegetables: {
    video: 'https://videos.pexels.com/video-files/7655575/7655575-uhd_3840_2160_25fps.mp4',
  },
};

export const CATEGORY_BANNER_MEDIA = {
  video: 'https://videos.pexels.com/video-files/29448550/12676722_3840_2160_30fps.mp4',
  poster: CATEGORY_MEDIA.fruit.poster,
};

export const getCategoryMedia = (name = '') => {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes('fruit')) return CATEGORY_MEDIA.fruit;
  if (normalizedName.includes('vegetable')) return CATEGORY_MEDIA.vegetables;
  return null;
};
