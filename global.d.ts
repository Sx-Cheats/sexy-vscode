declare global {
   interface Window {
      setWallpaper: (filePathName: string, playbackRate?: number) => void;
      forceRebootWallpaper: (playbackRate?: number) => void;
      wallpaperInit: boolean;
      WALLPAPERS: { static: { [key: string, value: string] }, animated: { [key: string, value: string] } };
   }

   interface Storage {
      wallpaperPlayBackRate?: string | number;
      wallpaper?: string
   }
}

export {}