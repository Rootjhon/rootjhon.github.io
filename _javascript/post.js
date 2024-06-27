import { basic, initSidebar, initTopbar } from './modules/layouts';
import {
  loadImg,
  imgPopup,
  initLocaleDatetime,
  initClipboard,
  toc
} from './modules/plugins';
import {
  highlightLines,
  runCpp,
  runJavascript,
  runPython,
  runRust,
} from './modules/plugins';

loadImg();
toc();
imgPopup();
initSidebar();
initLocaleDatetime();
initClipboard();
initTopbar();
basic();

highlightLines();
runCpp();
runJavascript();
runPython();
runRust();

