export interface PhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PhotoSrc;
  alt: string;
}

export interface VideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'uhd';
  file_type: string;
  width: number;
  height: number;
  link: string;
}

export interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: VideoFile[];
}