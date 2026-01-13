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
        this.multiTouch = false;
        this.soundSets = {
        	    LowAndFX: { 
        	    a: [0, 2000], 
        	    b: [2000, 4000], 
        	    c: [6000, 4000], 
        	    d: [10000, 4000],
        	    e: [14000, 4000],
        	    f: [18000, 4000], 
        	    g: [22000, 4000], 
        	    h: [26000, 4000], 
        	    p: [30000, 500]},
        	    High: { 
        	    a: [0, 4000], 
        	    b: [4000, 4000], 
        	    c: [8000, 4000], 
        	    d: [12000, 4000],
        	    e: [16000, 4000],
        	    f: [20000, 2000], 
        	    g: [22000, 4000], 
        	    h: [26000, 4000], 
        	    p: [30000, 500]},
        	    Drums: { 
        	    a: [0, 4000], 
        	    b: [4000, 4000], 
        	    c: [8000, 4000], 
        	    d: [12000, 4000],
        	    e: [16000, 4000],
        	    f: [20000, 4000], 
        	    g: [24000, 4000], 
        	    h: [28000, 2000], 
        	    p: [30000, 500]},
        	    NatureSounds: { 
        	    a: [0, 8000], 
        	    b: [8000, 8000], 
        	    c: [16000, 8000], 
        	    d: [24000, 8000],
        	    e: [32000, 8000],
        	    f: [40000, 8000], 
        	    g: [48000, 8000], 
        	    h: [56000, 8000], 
        	    p: [64000, 500]},
        	    OdeToJoy: { 
        	    a: [0, 1739], 
        	    b: [1739, 1716], 
        	    c: [3455, 1716], 
        	    d: [5171, 1714],
        	    e: [6886, 1712],
        	    f: [8598, 1281], 
        	    g: [9879, 1716], 
        	    h: [11595, 2141], 
        	    p: [13735, 500]},
        	    PopGoesTheWeasel: { 
        	    a: [0, 1166], 
        	    b: [1166, 1137], 
        	    c: [2303, 593], 
        	    d: [2896, 569],
        	    e: [3464, 1720],
        	    f: [5184, 2091], 
        	    g: [7275, 2477], 
        	    h: [9752, 2862], 
        	    p: [12614, 500]},
        	    OhDear: { 
        	    a: [0, 2205], 
        	    b: [2205, 2182], 
        	    c: [4387, 2182], 
        	    d: [6569, 2178],
        	    e: [8747, 2187],
        	    f: [10934, 2150], 
        	    g: [13084, 2214],
        	    h: [15298, 2178], 
        	    p: [17476, 500]},
        }
    }
     
     //loads sound sets
    preloads(soundSet,t) {
		var thread = new Howl({
  		src: ["assets/sound/"+soundSet+".mp3"],
  		volume: 0.2,
  		sprite: this.soundSets[soundSet]
		});
		this.threads[t] = thread;
    }

     //Set the video canvas to the right aspect ratio
    setVideoCanvasHeight(canvasId) {
        let canvas = document.getElementById(canvasId);
        let heightRatio = 1.33;
        canvas.height = canvas.width * heightRatio;

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
    parseCodesAsJavascript(topCodes) {
        let outputJS = "";
        this.codeThreads = [[],[],[],[]];
        let grid = this.sortTopCodesIntoGrid(topCodes);
        for (let i = 0; i < grid.length; i++) {
            outputJS += this.parseTopCodeLine(grid[i]);
        }
        return outputJS;
    }
    //Parse text code as javascript
    parseTextAsJavascript(text) {
        let outputJS = "";
        this.codeThreads = [[],[],[],[]];
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
  			}
		});
	}
    
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
    
    //parses each topcode to a line of javascript + add a text code version to the 'code' textarea
    parseTopCodeLine(line) {
        let lineJS = "\n";
        let i = 0;
        while (i < line.length) {
            let parsedCode = this.codeLibrary[line[i].code];
            if (parsedCode == this.commands.LOOP) {
						let nextSymbol = this.decodeDial(line[i].angle);
                        if (parseInt(nextSymbol)) {
                            lineJS += "for (let x" + this.variableIncrementer + "=0; x" + this.variableIncrementer + " < " + nextSymbol + "; x" + this.variableIncrementer + "++){\n";
                            document.getElementById('code').value += "LOOP "+nextSymbol+" TIMES\n";
                        }
            } else if (parsedCode == this.commands.ENDLOOP) {
                    lineJS += "} \n";
                    document.getElementById('code').value += "END LOOP\n";
            } else if (parsedCode == this.commands.PLAY) {
						let letter = this.decodeDial(line[i].angle);
                        lineJS += "this.codeThreads["+this.currThread+"].push('" + String.fromCharCode(parseInt(letter)+96) + "');\n";
                        document.getElementById('code').value +="PLAY "+letter+"\n";
            } else if (parsedCode == this.commands.PLAYX) {
                        lineJS += "this.codeThreads["+this.currThread+"].push(String.fromCharCode(this.userInput+96));\n";
                        document.getElementById('code').value += "PLAY X\n";
            } else if (parsedCode == this.commands.THREAD1) {
            	document.getElementById('code').value += "THREAD 1\n";
            	this.currThread = 0;
            } else if (parsedCode == this.commands.THREAD2) {
            	document.getElementById('code').value += "THREAD 2\n";
            	this.currThread = 1;
            } else if (parsedCode == this.commands.THREAD3) {
            	document.getElementById('code').value += "THREAD 3\n";
            	this.currThread = 2;
            } else if (parsedCode == this.commands.DELAY) {
            	let duration = this.decodeDial(line[i].angle);
            	for (let i = 0; i < parseInt(duration); i++) {
        			lineJS += "this.codeThreads["+this.currThread+"].push('p');\n";
        		}
        		document.getElementById('code').value +="DELAY "+duration+"\n";
        	} else if (parsedCode == this.commands.FUNCTION) {
            	this.funcActive = true;
            	document.getElementById('code').value += "FUNCTION\n";
            } else if (parsedCode == this.commands.ENDFUNCTION) {
            	this.funcActive = false;
            	document.getElementById('code').value += "END FUNCTION\n";
            } else if (parsedCode == this.commands.FUNCTIONCALL) {
            	lineJS += this.funcText;
            	document.getElementById('code').value += "CALL FUNCTION\n";
            } else if (parsedCode == this.commands.IF) {
            	let condition = this.decodeDial(line[i].angle);
            	lineJS += "if (this.userInput<"+parseInt(condition)+") {\n";
            	document.getElementById('code').value += "IF X < "+condition+"\n";
            } else if (parsedCode == this.commands.ENDIF) {
            	lineJS += "}\n";
            	document.getElementById('code').value += "END IF\n";
            } else if (parsedCode == this.commands.ELSE) {
            	lineJS += "} else {\n";
            	document.getElementById('code').value += "ELSE\n";
            } else if (parsedCode == this.commands.VARIABLE) {
            	let variable = this.decodeDial(line[i].angle);
            	lineJS += "this.userInput = "+parseInt(variable)+";\n";
            	document.getElementById('code').value += "X = "+variable+"\n";
            } else if (parsedCode == this.commands.RANDOM) {
            	lineJS += "this.userInput = Math.random() * (8 - 1) + 1;\n";
            	document.getElementById('code').value +="X = RANDOM\n";
            } else if (parsedCode == this.commands.INCREMENT) {
            	lineJS += "this.userInput +=1;\n";
            	document.getElementById('code').value +="X = X + 1\n";
            } else if (parsedCode == this.commands.DECREMENT) {
            	lineJS += "this.userInput -=1;\n";
            	document.getElementById('code').value +="X = X - 1\n";
            }
            i += 1;
            if (this.funcActive) {
        		this.funcText += lineJS;
        		lineJS = "";
        	}
        }
        return lineJS;
    }
    
    evalTile(tileCode, context) {
        eval('( (context) => {"use strict";' + tileCode + '})(context)');
        return true;
    }

	//runs scanned code, only runs if both left and right topcodes are visible, will make 5 attempts
    runCode() {
    	var self = this;
    	if (this.currentCodes) {
        //if (this.currentCodes && this.left && this.right) {
        	document.getElementById('code').value = "";
            let parsedJS = this.declarations + this.parseCodesAsJavascript(this.currentCodes);
            console.log(parsedJS);
            this.attempts = 0;
            let parsedLines = [];
            parsedLines.push(this.evalTile(parsedJS, this));
            for (let i = 0; i < this.codeThreads.length; i++) {
            	if (this.codeThreads[i].length > 0) {
        			this.playStart(this.threads[i],this.codeThreads[i]);
        		}
        	}
        	this.funcText = "";
        } else if (this.attempts < 5) {
        	this.attempts += 1;
        	console.log(this.attempts);
        	setTimeout(function() {
  				self.runCode();
			}, 100);
        }
    }
    
    //runs the text code from the 'code' text area
    runTextCode() {
     	var codeText = document.getElementById("code");
 		var code = codeText.value.toLowerCase();
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
    
    //reads out the text code from the 'code' textarea
    readCode() {
    	var codeText = document.getElementById("code");
 		var code = codeText.value.toLowerCase();
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

        // Setup buttons
        //runs scanned code if camera is active, otherwise run text code from 'code' textarea
        let runButton = document.getElementById('run');
        runButton.onclick = function () {
    		if (document.getElementById('camera-button').checked) {
    			this.runCode();
    		} else {
    			this.runTextCode();
    		}
        }.bind(this);
        
        let readButton = document.getElementById('read');
        readButton.onclick = function () {
			this.readCode();
        }.bind(this);
        
        let switchBtn = document.getElementById('switch-view');
        switchBtn.onclick = function () {
        	TopCodes.stopVideoScan('video-canvas');
        	if (this.mode === "user") {
        		this.mode = "environment";
        	} else {
        		this.mode = "user";
        	}
        	TopCodes.startStopVideoScan('video-canvas',this.mode);
        }.bind(this);
        
        let remoteBtn = document.getElementById('remote-button');
        remoteBtn.onclick = function () {
        	if (document.getElementById('remote-button').checked) {
        		this.multiTouch = true;
        	} else {
        		this.multiTouch = false;
        	}
        }.bind(this);
        
        let cameraBtn = document.getElementById('camera-button');
        cameraBtn.onclick = function () {
    		if (document.getElementById('camera-button').checked) {
    			this.cameraStatus = true;
    		} else {
    			this.cameraStatus = false;
    		}
            TopCodes.startStopVideoScan('video-canvas',this.mode);
        }.bind(this);
        
        let setSelect1 = document.getElementById('soundSets1');
        setSelect1.onchange = function () {
        	this.preloads(setSelect1.value,0);
        }.bind(this);
        
        let setSelect2 = document.getElementById('soundSets2');
        setSelect2.onchange = function () {
        	this.preloads(setSelect2.value,1);
        }.bind(this);
        
        let setSelect3 = document.getElementById('soundSets3');
        setSelect3.onchange = function () {
        	this.preloads(setSelect3.value,2);
        }.bind(this);
        
       let multi = document.getElementById('main');
       multi.addEventListener('touchstart', function (e) {
  			if(e.touches.length == 3 && this.multiTouch) {
    			if (document.getElementById('camera-button').checked) {
    				this.runCode();
    			} else {
    				this.runTextCode();
    			}
  			}
		}.bind(this))
        
        // Run preloads
        this.preloads("LowAndFX",0);
        this.preloads("High",1);
        this.preloads("Drums",2);
        
        }
}
