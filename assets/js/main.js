/*jshint esversion: 8 */
import Tangible from "./tangible.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('export')) {
    hideExport(true);
} else {
	hideExport(false);
}

/* Load the main Tangible class and setup */
let tangible = new Tangible();

tangible.setupTangible();

const context = new AudioContext();
unmute(context);

let runButton = document.getElementById('run');
runButton.addEventListener('mouseup', function (e) {
    if (tangible.isAudioPlaying()) {
        tangible.stopAllSounds();
    } else {
    	if (document.getElementById('camera-button').checked) {
    		document.getElementById('code').value = tangible.scanCode();
    	}
    	let textCode = document.getElementById('code').value;
    	tangible.runTextCode(textCode);
    }
}.bind(this));
        
let readButton = document.getElementById('read');
readButton.addEventListener('mouseup', function (e) {
	if (tangible.isAudioPlaying()) {
    	tangible.stopAllSounds();
    } else {
    	if (document.getElementById('camera-button').checked) {
    		document.getElementById('code').value = tangible.scanCode();
    	}
    	let textCode = document.getElementById('code').value;
    	tangible.readCode(textCode);
    }
}.bind(this));
        
let recordButton = document.getElementById('record');
recordButton.addEventListener('mouseup', function (e) {
	if (tangible.isAudioPlaying()) {
        tangible.stopAllSounds();
    } else {
    	if (document.getElementById('camera-button').checked) {
    		document.getElementById('code').value = tangible.scanCode();
    	}
    	let textCode = document.getElementById('code').value;
    	tangible.recordCode(textCode);
    }
}.bind(this));
        
let cameraBtn = document.getElementById('camera-button');
    cameraBtn.onclick = function () {
        
    	if (document.getElementById('camera-button').checked) {
    		tangible.cameraStatus = true;
    	} else {
    		tangible.cameraStatus = false;
    	}
        TopCodes.startStopVideoScan('video-canvas',tangible.mode);
        hideVideo();
}.bind(this);
        
let setSelect1 = document.getElementById('soundSets1');
setSelect1.onchange = function () {
    tangible.preloads(setSelect1.value,0);
}.bind(this);
        
let setSelect2 = document.getElementById('soundSets2');
setSelect2.onchange = function () {
    tangible.preloads(setSelect2.value,1);
}.bind(this);
        
let setSelect3 = document.getElementById('soundSets3');
setSelect3.onchange = function () {
    tangible.preloads(setSelect3.value,2);
}.bind(this);


let multi = document.getElementById('main');
multi.addEventListener('touchstart', function (e) {
	if(e.touches.length == 3) {
    	if (tangible.isAudioPlaying()) {
        	tangible.stopAllSounds();
        } else {
    		if (document.getElementById('camera-button').checked) {
    			document.getElementById('code').value = tangible.scanCode();
    		}
    		let textCode = document.getElementById('code').value;
    		tangible.runTextCode(textCode);
    	}
    }
}.bind(this))
		
function hideVideo() {
	var vid = document.getElementById("video");
	if (document.getElementById('camera-button').checked) {
    	vid.style.display = "block";
	} else {
    	vid.style.display = "none";
	}
}

function hideExport(s) {
	var record = document.getElementById("record");
	if (s) {
    	record.style.display = "block";
	} else {
    	record.style.display = "none";
	}
}

document.addEventListener('keydown', function(event) {
    console.log('Key pressed: ' + event.key);
    if (event.key == "ArrowRight" || event.key == "PageDown") {
        if (tangible.isAudioPlaying()) {
        tangible.stopAllSounds();
    } else {
    	if (document.getElementById('camera-button').checked) {
    		document.getElementById('code').value = tangible.scanCode();
    	}
    	let textCode = document.getElementById('code').value;
    	tangible.runTextCode(textCode);
    }
    } else if (event.key == "ArrowRight" || event.key == "PageUp") {
    		if (tangible.isAudioPlaying()) {
    	tangible.stopAllSounds();
    } else {
    	if (document.getElementById('camera-button').checked) {
    		document.getElementById('code').value = tangible.scanCode();
    	}
    	let textCode = document.getElementById('code').value;
    	tangible.readCode(textCode);
    }
    }
});

if (urlParams.has('flipped')) {
    tangible.flipped = true;
    tangible.rotate = 180;
    document.getElementById("video-canvas").style.transform = "scale(1, -1)";
    document.getElementById("video-canvas").width = 1280;
    document.getElementById("video-canvas").height = 720;
}

hideVideo();
		
tangible.preloads("MusicLoops1",0);
tangible.preloads("MusicLoops1",1);
tangible.preloads("MusicLoops1",2);