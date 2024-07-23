
import  isNumber  from "lodash/isNumber"


const CUSTOM_LOGO = `<svg clip-rule="evenodd" fill-rule="evenodd"  stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><g id="Icon"><circle cx="7" cy="17.154" r="4.25"/><circle cx="17" cy="17.154" r="4.25"/><path d="m10.916 16.042c.656-.438 1.512-.438 2.168 0 .344.229.81.136 1.04-.208.23-.345.136-.811-.208-1.041-1.16-.773-2.672-.773-3.832 0-.344.23-.438.696-.208 1.041.23.344.696.437 1.04.208z"/><path d="m19 4.669c-.194-.765-.708-1.41-1.411-1.77s-1.527-.401-2.262-.111c0 0-2.869 1.129-2.869 1.129-.294.116-.622.116-.916 0 0 0-2.869-1.129-2.869-1.129-.735-.29-1.559-.249-2.262.111s-1.217 1.005-1.411 1.77l-1.727 6.8c-.057.224-.007.462.135.645s.361.29.592.29h16c.231 0 .45-.107.592-.29s.192-.421.135-.645z"/><path d="m22 10.904h-20c-.414 0-.75.336-.75.75s.336.75.75.75h20c.414 0 .75-.336.75-.75s-.336-.75-.75-.75z"/></g></svg>`;

const BASE_PATH_FOLDERS_WALLPAPERS = `base path of wallpapers folder example: /Users/lamoula/wallpaperFolder`;

window.WALLPAPERS = {
  static: {
    // file name + ext, example: lamoula.png

  
  },
  animated: {
     // file name + ext, example: lamoula.mp4
  }
};


const videoFilesSupported = ["mp4", "mp4s","m4p", "webm"];
const imageFilesSupported = [ "svg", "webp", "gif", "png", "jpg", "jpeg"];


function setCustomLogoInVsCode() {

  const vsCodeLogo = document.querySelector(".monaco-workbench.vs-dark .part.editor>.content .editor-group-container .editor-group-watermark>.letterpress");

  if(!vsCodeLogo) {return;}

  vsCodeLogo.innerHTML = CUSTOM_LOGO;

}

function initWallpaperVsCode(forcedReboot: boolean = false, playbackRate: number | string | null = null ) {

  try {

  const wallpaperElementFile = window.localStorage.wallpaper ?? null;

  if(!wallpaperElementFile) { return; };


  if(window.wallpaperInit && !forcedReboot) { 
    return;
  };

  window.wallpaperInit = true;

  if(forcedReboot) {
    document.getElementsByClassName("vscode-background-custom")?.[0]?.remove?.();
  }

  const fileType  = wallpaperElementFile.match(/\w+$/g)?.[0].toLocaleLowerCase();

  if(!fileType) {
    return;
  }

  if(videoFilesSupported.includes(fileType)) {
    let playBackRateSaved = window.localStorage.wallpaperPlayBackRate ? parseFloat((window.localStorage.wallpaperPlayBackRate).toString()) : null;
    let playBackFormArg = isNumber(playbackRate) ? parseFloat((playbackRate).toString()) : null;
    if(!playBackRateSaved || !isNumber(playBackRateSaved) || (playBackRateSaved !== playBackFormArg && (playBackFormArg || playBackFormArg === 0))) {
      playBackRateSaved = playBackFormArg ?? 1;
    }
    window.localStorage.wallpaperPlayBackRate =  playBackRateSaved;

    const videoElement = document.createElement("video");
    const videoSourceElement = document.createElement("source");

    videoElement.loop= true;
    videoElement.muted= true;
    videoElement.autoplay=true;
    videoElement.setAttribute("controls", "true");

    videoElement.playbackRate = playBackRateSaved;

    videoElement.className = "vscode-background-custom is-video";
    videoElement.id="vscode-background-animated";

    videoSourceElement.id= "vscode-background-animated-source";
    videoSourceElement.type="video/mp4";
    videoSourceElement.src = `${wallpaperElementFile}`;


    videoElement.appendChild(videoSourceElement);

    document.getElementsByClassName("chromium")[0].appendChild(videoElement);

//   window.addEventListener('focus', function(): void {
//     videoElement.play();
// });

//   window.addEventListener('blur', function(): void {
//     videoElement.pause();
// });

  } else if(imageFilesSupported.includes(fileType)) {
    const customWallpaper = document.createElement("img");
    customWallpaper.src = `${wallpaperElementFile}`;
    customWallpaper.className = "vscode-background-custom is-img";

    // window.onfocus = null;
    // window.onblur = null;

    document.getElementsByClassName("chromium")[0].appendChild(customWallpaper);
  } else {
    alert(`File ${wallpaperElementFile} not supported`);
  }

  } catch (error) {
      console.error(error);
      window.wallpaperInit = false;
      alert("initWallpaperVsCode error ocurred !");
  }
}

function setAnimatedWallpaperForm(filePathName: string, playbackRate: number = 1): void {
  try {
  if(!filePathName) {
    window.localStorage.wallpaper = undefined;
    document.getElementsByClassName("vscode-background-custom")?.[0]?.remove?.();
    return;
  }

  const fileNameFormatted =  `${BASE_PATH_FOLDERS_WALLPAPERS}/${filePathName}`;
  window.localStorage.wallpaper = fileNameFormatted;
  initWallpaperVsCode(true, playbackRate);
    } catch (error) {
          console.error(error);
  }
}

window.forceRebootWallpaper = (playbackRate = 1) => initWallpaperVsCode(true, playbackRate);
window.setWallpaper = (filePathName, playbackRate): void => setAnimatedWallpaperForm(filePathName, playbackRate);


function boot(): void {
  initWallpaperVsCode();  
  setCustomLogoInVsCode();
}

boot();