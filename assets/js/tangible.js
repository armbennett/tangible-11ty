/*jshint esversion: 8 */

export default class Tangible {

    constructor() {
        this.commands = {
            "LOOP": "Loop",
            "ENDLOOP": "End Loop",
            "PLAY": "Play",
            "THREAD1": "Thread 1",
            "THREAD2": "Thread 2",
            "THREAD3": "Thread 3",
            "DELAY": "Delay",
            "FUNCTION": "Function",
            "ENDFUNCTION": "End Function",
            "FUNCATION CALL": "Call Function",
            "IF": "If",
            "ENDIF": "End If",
            "ELSE": "Else",
            "VARIABLE": "x =",
            "RANDOM": "x = random",
            "INCREMENT": "x = x + 1",
            "PLAYX": "Play x",
            "DECREMENT": "x = x - 1"
        };
        // Code library for translations
        // Will be made into its getter/setter
        this.codeLibrary = {
            31: this.commands.PLAY,
            47: this.commands.DELAY,
            55: this.commands.LOOP,
            59: this.commands.ENDLOOP,
            61: this.commands.FUNCTION,
            79: this.commands.ENDFUNCTION,
            87: this.commands.IF,
            91: this.commands.ENDIF,
            93: this.commands.ELSE,
            103: "0",
            107: "1",
            109: "2",
            115: "3",
            117: "4",
            121: "5",
            143: "6",
            151: "7",
            155: "8",
            157: "9",
            205: this.commands.INCREMENT,
            211: this.commands.PLAYX,
            213: this.commands.DECREMENT,
            327: this.commands.THREAD1,
            331: this.commands.THREAD2,
            333: this.commands.THREAD3,
            341: this.commands.FUNCTIONCALL,
            345: this.commands.VARIABLE,
            355: this.commands.RANDOM
        };
        this.topcodeHeight = 40;
        this.topcodeWidth = 100;
        this.userInput = 0; // value of TIBBL variable stored here
        this.synthesis = window.speechSynthesis;
        this.variableIncrementer = 0;
		this.mode = "environment";
		this.cameraStatus = false; //camera on or off
		this.threads = [[],[],[]]; //holds the currently selected sound sets
		this.codeThreads = [[],[],[]]; //the sounds to be played when program is run are queued here
        this.declarations = "";
        this.currentCodes = []; //topcodes currently seen
        this.currThread = 0; //used to keep track of current thread when parsing program
        this.t = 0;
        this.attempts = 0; //keep track of number of attempts to successfully scan and run program
        this.funcText = "";
        this.funcActive = false;
        this.soundSets = {
        	    OdeToJoy: { 
        	    a: [0, 1739], 
        	    b: [1739, 1716], 
        	    c: [3455, 1716], 
        	    d: [5171, 1714],
        	    e: [6886, 1712],
        	    f: [8598, 1281], 
        	    g: [9879, 1716], 
        	    h: [11595, 2141], 
        	    p: [13735, 1000]},
        	    FurElise: { 
        	    a: [0, 1241], 
        	    b: [1241, 1237], 
        	    c: [2478, 1228], 
        	    d: [3706, 1224],
        	    e: [4930, 1232],
        	    f: [6163, 1220], 
        	    g: [7382, 1215],
        	    h: [8597, 1220], 
        	    p: [9817, 1000]},
        	    MusicLoops1: { 
        	    a: [0, 1000], 
        	    b: [1000, 1000], 
        	    c: [2000, 1000], 
        	    d: [3000, 1000],
        	    e: [4000, 4000],
        	    f: [8000, 4000], 
        	    g: [12000, 4000],
        	    h: [16000, 4000], 
        	    p: [20000, 1000]},
        	    Notifications: { 
        	    a: [0, 1000], 
        	    b: [1000, 1000], 
        	    c: [2000, 1000], 
        	    d: [3000, 1000],
        	    e: [4000, 1000],
        	    f: [5000, 1000], 
        	    g: [6000, 1000],
        	    h: [7000, 1000], 
        	    p: [8000, 1000]},
        	    Numbers: { 
        	    a: [0, 1000], 
        	    b: [1000, 1000], 
        	    c: [2000, 1000], 
        	    d: [3000, 1000],
        	    e: [4000, 1000],
        	    f: [5000, 1000], 
        	    g: [6000, 1000],
        	    h: [7000, 1000], 
        	    p: [8000, 1000]},
        	    Mystery: { 
        	    a: [0, 4000], 
        	    b: [4000, 2000], 
        	    c: [6000, 4000], 
        	    d: [10000, 4000],
        	    e: [14000, 4000],
        	    f: [18000, 4000], 
        	    g: [22000, 2000],
        	    h: [24000, 8000], 
        	    p: [31998, 1000]},
        }
    }
     
     //loads sound sets
    preloads(soundSet,t) {
    	const isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
		var thread = new Howl({
  		src: ["assets/sound/"+soundSet+".mp3"],
  		volume: 0.4,
  		sprite: this.soundSets[soundSet],
  		//html5: isIOS
		});
		this.threads[t] = thread;
    }

     //Set the video canvas to the right aspect ratio
    setVideoCanvasHeight(canvasId) {
        let canvas = document.getElementById(canvasId);
        let heightRatio = 1.33;
        canvas.height = canvas.width * heightRatio;

    }
    
    stopAllSounds() {
		this.threads[0].off('end');
		this.threads[1].off('end');
		this.threads[2].off('end');
		this.threads[0].stop();
		this.threads[1].stop();
		this.threads[2].stop();
    }

    isAudioPlaying() {
  		var sounds = Howler._howls;
  		for (var i = 0; i < sounds.length; i++) {
    		if (sounds[i].playing()) {
      			return true;
    		}
  		}
  		return false;
	}	

    /**
     Parse the topcodes that are found.  Each item in the array topCodes has:
     x,y coordinates found and code: the int of topcode
     @param topCodes Found codes
     @return text translations of code
     */
     
    parseCodesAsText(topCodes) {
        let outputString = "";
        let grid = this.sortTopCodesIntoGrid(topCodes);
        for (let i = 0; i < grid.length; i++) {
            for (let x = 0; x < grid[i].length; x++) {
                outputString += this.codeLibrary[grid[i][x].code] + ", X:" + grid[i][x];
            }
            outputString += "<br/>\n";
        }
        return outputString;
    }

    /** Sort topcodes into a grid using x,y coordinates
     *
     * @param topCodes to sort
     * @return multi-dimensional grid array
     */
    sortTopCodesIntoGrid(topCodes) {
        // Sort topcodes by y, then x
        topCodes.sort(this.sortTopCodeComparator.bind(this));
        //console.log(topCodes);
        let grid = [];
        let line = Array();
        let currentY = -1;
        // loop through, add lines as y changes
        for (let i = 0; i < topCodes.length; i++) {
            if (currentY >= 0 && topCodes[i].y - currentY >= this.topcodeHeight) {
                // New line
                grid.push(line);
                line = Array();
                currentY = topCodes[i].y;
            } else if (currentY < 0) {
                currentY = topCodes[i].y;
            }
            line.push(topCodes[i]);
        }
        // Add last line and return
        grid.push(line);
        return grid;
    }

    /**
     * Sort the top codes y ascending
     * X DESCENDING because the video is mirrorer
     * @param a
     * @param b
     * @return {number}
     */
    sortTopCodeComparator(a, b) {

        if (Math.abs(a.y - b.y) <= this.topcodeHeight) {
            // same line
            if (a.x == b.x) {
                return 0;
            }
            if (a.x < b.x) {
                return 1;
            }
            return -1;
        }
        // Different lines
        if (a.y < b.y) {
            return -1;
        }
        return 1;
    }

    /**
     Parse topcodes as javascript.  Each item in the array topCodes has:
     x,y coordinates found and code: the int of topcode
     @param topCodes Found codes
     @return text translations of code
     */
    parseCodesAsText(topCodes) {
        let outputText = "";
        this.codeThreads = [[],[],[]];
        let grid = this.sortTopCodesIntoGrid(topCodes);
        for (let i = 0; i < grid.length; i++) {
            outputText += this.parseTopCodeLine(grid[i]);
        }
        return outputText;
    }
    //Parse text code as javascript
    parseTextAsJavascript(text) {
        let outputJS = "";
        this.codeThreads = [[],[],[]];
 		var codeArray = text.split('\n');
 		for (let i = 0; i < codeArray.length; i++) {
 			codeArray[i] = codeArray[i].split(" ");
 			outputJS += this.parseTextCodeLine(codeArray[i]);
 		}
        return outputJS;
    }
    
    //begins playback of thread and queues up each sound to play as the previous one ends
    playStart(s,l) {
		s.play(l[0]);
		s.on('end', function(){
  			l.shift();
 			if (l.length > 0) {
  				s.play(l[0]);
  			} else {
  				l = [];
  				this.playingSounds = [];
  			}
		});
	}
	
	//plays and records current program
	recordProgram(s,l,d) {
		const mediaDest = Howler.ctx.createMediaStreamDestination();
		Howler.masterGain.connect( mediaDest );

		// set up media recorder to record output
		const audioChunks = []
		const mediaRecorder = new MediaRecorder( mediaDest.stream, { mimeType: 'audio/webm' } );

		mediaRecorder.onstart = (event) =>
  		{ console.log('Started recording Howl output...') };
		mediaRecorder.ondataavailable = (event) =>
  		{ audioChunks.push( event.data ) };
		mediaRecorder.onstop = (event) =>
  		{ const blob = new Blob((audioChunks), {
        	type: 'audio/webm'
      	});
        	const anchor = document.createElement('a');
      		document.body.appendChild(anchor);
      		anchor.style = 'display: none';
      		const url = window.URL.createObjectURL(blob);
      		anchor.href = url;
      		anchor.download = 'myProgram.webm';
      		anchor.click();
      		window.URL.revokeObjectURL(url);
  		}
  		if (d) { mediaRecorder.start(); }
  		s.play(l[0]);
		s.on('end', function(){
  			l.shift();
 			if (l.length > 0) {
  				s.play(l[0]);
  			} else {
  				l = [];
  				if (d) { mediaRecorder.stop(); }
  			}
		});
  	};
    
    //converts the angle value of the topcode to a number between 1 and 8
    decodeDial(ang) {
        let letter = "";
        if (ang < 0.43) {
            letter = "5";
        } else if (ang < 1.4) {
            letter = "4";
        } else if (ang < 1.98) {
            letter = "3";
        } else if (ang < 2.85) {
            letter = "2";
        } else if (ang < 3.62) {
            letter = "1";
        } else if (ang < 4.30) {
            letter = "8";
        } else if (ang < 5.07) {
            letter = "7";
        } else {
            letter = "6";
        }
        //console.log(ang);
        //console.log(letter);
        return letter;
    }

	//parses each line of text code to a line of javascript
    parseTextCodeLine(line) {
        let lineJS = "\n";
        let i = 0;
            if (line[i] == "loop") {
				let nextSymbol = line[i+1];
                if (parseInt(nextSymbol)) {
                    lineJS += "for (let x" + this.variableIncrementer + "=0; x" + this.variableIncrementer + " < " + nextSymbol + "; x" + this.variableIncrementer + "++){\n";
                }
            } else if (line[i] == "end" && line[i+1] == "loop") {
                    lineJS += "}\n";
            } else if (line[i] == "end" && line[i+1] == "if") {
                    lineJS += "}\n";
            } else if (line[i] == "play") {
            	if (line[i+1] == "x") {
            		lineJS += "this.codeThreads["+this.currThread+"].push(String.fromCharCode(this.userInput+96));\n";
            	} else {
            		let letter = line[i+1];
                    lineJS += "this.codeThreads["+this.currThread+"].push('" + String.fromCharCode(parseInt(letter)+96) + "');\n";
            	}                    
            } else if (line[i] == "thread" && line[i+1]=="1") {
            	this.currThread = 0;
            } else if (line[i] == "thread" && line[i+1]=="2") {
            	this.currThread = 1;
            } else if (line[i] == "thread" && line[i+1]=="3") {
            	this.currThread = 2;
            } else if (line[i] == "delay") {
            	let duration = line[i+1];
            	for (let i = 0; i < parseInt(duration); i++) {
        			lineJS += "this.codeThreads["+this.currThread+"].push('p');\n";
        		}
        	} else if (line[i] == "function") {
            	this.funcActive = true;
            } else if (line[i] == "call") {
            	lineJS += this.funcText;
            } else if (line[i] == "end" && line[i+1] == "function") {
            	this.funcActive = false;
            } else if (line[i] == "if") {
            	let condition = line[i+3];
            	lineJS += "if (this.userInput<"+parseInt(condition)+") {\n";
            } else if (line[i] == "else") {
            	lineJS += "} else {\n";
            } else if (line[i] == "x") {
            	if (line[i+2] == "random") {
            		lineJS += "this.userInput = Math.random() * (8 - 1) + 1;\n";
            	} else if (line[i+3] == "+") {
            		lineJS += "this.userInput +=1;\n";
            	} else if (line[i+3] == "-") {
            		lineJS += "this.userInput -=1;\n";
            	} else {
            		let variable = line[i+2];
            		lineJS += "this.userInput = "+parseInt(variable)+";\n";
            		}
            }
        if (this.funcActive) {
        	this.funcText += lineJS;
        	lineJS = "";
        }
        return lineJS;
    }
    
    //parses each topcode to a line of text code
    parseTopCodeLine(line) {
        let lineText = "";
        let i = 0;
        while (i < line.length) {
            let parsedCode = this.codeLibrary[line[i].code];
            if (parsedCode == this.commands.LOOP) {
						let nextSymbol = this.decodeDial(line[i].angle);
                        if (parseInt(nextSymbol)) {
                            lineText += "LOOP "+nextSymbol+" TIMES\n";
                        }
            } else if (parsedCode == this.commands.ENDLOOP) {
                    lineText += "END LOOP\n";
            } else if (parsedCode == this.commands.PLAY) {
						let letter = this.decodeDial(line[i].angle);
                        lineText +="PLAY "+letter+"\n";
            } else if (parsedCode == this.commands.PLAYX) {
                        lineText += "PLAY X\n";
            } else if (parsedCode == this.commands.THREAD1) {
            	lineText += "THREAD 1\n";
            } else if (parsedCode == this.commands.THREAD2) {
            	lineText += "THREAD 2\n";
            } else if (parsedCode == this.commands.THREAD3) {
            	lineText += "THREAD 3\n";
            } else if (parsedCode == this.commands.DELAY) {
            	let duration = this.decodeDial(line[i].angle);
        		lineText +="DELAY "+duration+"\n";
        	} else if (parsedCode == this.commands.FUNCTION) {
            	lineText += "FUNCTION\n";
            } else if (parsedCode == this.commands.ENDFUNCTION) {
            	lineText += "END FUNCTION\n";
            } else if (parsedCode == this.commands.FUNCTIONCALL) {
            	lineText += "CALL FUNCTION\n";
            } else if (parsedCode == this.commands.IF) {
            	let condition = this.decodeDial(line[i].angle);
            	lineText += "IF X < "+condition+"\n";
            } else if (parsedCode == this.commands.ENDIF) {
            	lineText += "END IF\n";
            } else if (parsedCode == this.commands.ELSE) {
            	lineText += "ELSE\n";
            } else if (parsedCode == this.commands.VARIABLE) {
            	let variable = this.decodeDial(line[i].angle);
            	lineText += "X = "+variable+"\n";
            } else if (parsedCode == this.commands.RANDOM) {
            	lineText +="X = RANDOM\n";
            } else if (parsedCode == this.commands.INCREMENT) {
            	lineText +="X = X + 1\n";
            } else if (parsedCode == this.commands.DECREMENT) {
            	lineText +="X = X - 1\n";
            }
            i += 1;
        }
        return lineText;
    }
    
    evalTile(tileCode, context) {
        eval('( (context) => {"use strict";' + tileCode + '})(context)');
        return true;
    }

	//scans the tangible code and returns text code
    scanCode() {
    	var self = this;
    	if (this.currentCodes) {
        //if (this.currentCodes && this.left && this.right) {
            let parsedText = this.declarations + this.parseCodesAsText(this.currentCodes);
            console.log(parsedText);
            this.attempts = 0;
            return parsedText;
        } else if (this.attempts < 5) {
        	this.attempts += 1;
        	console.log(this.attempts);
        	setTimeout(function() {
  				let parsedText = self.scanCode();
			}, 100);
        }
    }
    
    //runs the text code
    runTextCode(codeText) {
 		var code = codeText.toLowerCase();
        let parsedJS = this.parseTextAsJavascript(code);
        console.log(parsedJS);
        let parsedLines = [];
        parsedLines.push(this.evalTile(parsedJS, this));
        for (let i = 0; i < this.codeThreads.length; i++) {
            if (this.codeThreads[i].length > 0) {
        		this.playStart(this.threads[i],this.codeThreads[i]);
        	}
        }
        this.funcText = "";
    }
    
    getThreadDuration() {
    	let durations = [];
    	for (let i = 0; i < this.codeThreads.length; i++) {
            if (this.codeThreads[i].length > 0) {
            	let temp = 0;
            	for (let x = 0; x < this.codeThreads[i].length; x++) {
        			temp += this.threads[i]._sprite[this.codeThreads[i][x]][1];
        		}
        		durations.push(temp);
        	} else {
        		durations.push(0);
        	}
        }
    	return durations;
    }
    
    recordCode(codeText) {
 		var code = codeText.toLowerCase();
        let parsedJS = this.parseTextAsJavascript(code);
        let parsedLines = [];
        parsedLines.push(this.evalTile(parsedJS, this));
        let duration = this.getThreadDuration();
		let longestThread = duration.indexOf(Math.max.apply(Math, duration));
		console.log(longestThread);
        for (let i = 0; i < this.codeThreads.length; i++) {
            if (this.codeThreads[i].length > 0) {
            	if (i == longestThread) {
            		this.recordProgram(this.threads[i],this.codeThreads[i],true);
            	} else {
            		this.recordProgram(this.threads[i],this.codeThreads[i],false);
            	}
        	}
        }
        this.funcText = "";
    }
    
    //reads out the text code
    readCode(codeText) {
 		var code = codeText.toLowerCase();
    	var codeArray = code.split('\n');
		for (let i = 0; i < codeArray.length; i++) {
            	var utterance = new SpeechSynthesisUtterance(codeArray[i]);
            	this.synthesis.speak(utterance);
        }
    }
	
    setupTangible() {
        this.setVideoCanvasHeight('video-canvas');
        let tangible = this;
        var ctx = document.querySelector("#video-canvas").getContext('2d');
        // register a callback function with the TopCode library
        TopCodes.setVideoFrameCallback("video-canvas", function (jsonString) {
            // convert the JSON string to an object
            var json = JSON.parse(jsonString);
            // get the list of topcodes from the JSON object
            var topcodes = json.topcodes;
            // obtain a drawing context from the <canvas>
            // draw a circle over the top of each TopCode
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";   // very translucent red
            for (let i = 0; i < topcodes.length; i++) {
                ctx.beginPath();
                ctx.arc(topcodes[i].x, topcodes[i].y, topcodes[i].radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.font = "26px Arial";
                ctx.fillText(topcodes[i].code, topcodes[i].x, topcodes[i].y);
            tangible.currentCodes = topcodes;
            tangible.once = true;
            }
        }, this);     
        }
}
