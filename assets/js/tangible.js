/*jshint esversion: 8 */


export default class Tangible {

    constructor() {
        this.commands = {
            "LOOP": "Loop",
            "ENDLOOP": "End Loop",
            "PLAY": "Play",
        };
        // Code library for translations
        // Will be made into its getter/setter
        this.codeLibrary = {
            31: this.commands.PLAY,
            47: "Delay",
            55: this.commands.LOOP,
            59: this.commands.ENDLOOP,
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
            167: "A",
            171: "B",
            173: "C",
            179: "D",
            181: "E",
            185: "F",
            199: "G",
            203: "H",
            205: "I",
            211: "J",
            213: "K",
            217: "L",
            227: "M",
            229: "N",
            233: "O",
            241: "P",
            271: "Q",
            279: "R",
            282: "S",
            285: "T",
            295: "U",
            299: "V",
            301: "W",
            307: "X",
            309: "Y",
            313: "Z",
        };
        this.topcodeHeight = 40;
        this.topcodeWidth = 100;
        this.variableIncrementer = 0;
		this.mode = "environment";
        this.declarations = "";
        // Codes currently seen
        this.currentCodes = [];
        this.soundSets = {
            GimmeGimmeGimme: [["A","B","C","D"],['challenge1','challenge2']],
            EyeOfTheTiger: [["A","B","C","D"],['challenge1','challenge2']],
            DoctorFoster: [["A","B","C","D","E","F"],['']],
            JingleBells: [["A","B","C","D","E","F"],['challenge1']],
            Limerick1: [["A","B","C","D","E","F","G","H"],['challenge1']],
            Limerick2: [["A","B","C","D","E","F","G"],['']],
            Limerick3: [["A","B","C","D","E"],['challenge1']],
            Poem: [["A","B","C","D","E","F","G","H"],['']],
            Popcorn: [["A","B","C","D"],['challenge1']],
            RowYourBoat: [["A","B","C","D","E","F","G","H"],['challenge1']],
            Story: [["A","B","C","D","E","F","G","H"],['challenge1']]
        }
    }

    /** Loads assets and data for this set of tiles
     *
     *
     */
    preloads(soundSet) {
		var soundsTemp = {};
		
		this.soundSets[soundSet][0].forEach(function(element) {
    	soundsTemp[element] = new Audio("assets/sound/"+soundSet+"/"+element+".mp3");
		});
		document.getElementById("challenges").innerHTML = '';
		let challenge = 1;
		if (this.soundSets[soundSet][1] != ''){
		this.soundSets[soundSet][1].forEach(function(element) {
		document.getElementById("challenges").innerHTML += "<h3>Challenge "+challenge+"</h3><audio controls><source src='assets/sound/"+soundSet+"/"+element+".mp3' type='audio/mpeg'></audio>";
		challenge += 1;
		});
		};
		this.sounds = soundsTemp;
    }

    playAudio(audio) {
     return new Promise(res => {
            audio.play();
            audio.onended = res;
        });
    }

    /**
     Set the video canvas to the right aspect ratio
     */
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
        let grid = this.sortTopCodesIntoGrid(topCodes);
        //console.log(grid);
        for (let i = 0; i < grid.length; i++) {
            outputJS += this.parseTopCodeLine(grid[i]);
        }
        /*for (let i = 0; i < topCodes.length; i++) {
            if (topCodes[i].code in this.codeLibrary){
                outputJS += this.codeLibrary[topCodes[i].code] + " ";

            }
        }*/
        return outputJS;
    }


    parseTopCodeLine(line) {
        //this.codeLibrary[grid[i][x].code]
        let lineJS = "\n";
        let i = 0;
        while (i < line.length) {
            let parsedCode = this.codeLibrary[line[i].code];
            //console.log(parsedCode);
            switch (parsedCode) {
                case this.commands.LOOP:
                    // See if we've got a number next
                    if (line.length > i + 1) {
                        let nextSymbol = this.codeLibrary[line[i + 1].code];
                        if (parseInt(nextSymbol)) {
                            lineJS += "for (let x" + this.variableIncrementer + "=0; x" + this.variableIncrementer + " < " + nextSymbol + "; x" + this.variableIncrementer + "++){";
                            this.variableIncrementer += 1;
                            i += 1;
                        }
                    } else {
                        //console.log("ERROR: No increment or bad increment for for loop!");
                    }
                    break;
                case this.commands.ENDLOOP:
                    lineJS += "} \n";
                    break;
                case this.commands.PLAY:
                    if (line.length > i + 1) {
                        let letter = this.codeLibrary[line[i + 1].code];
                        //console.log(letter);
                        lineJS += "await context.playAudio(this.sounds." + String.fromCharCode(parseInt(letter)+65) + ");\n";
                        //lineJS += "await new Promise(r => setTimeout(resolve, this.sounds." + letter + ".duration * 100));";
                    }
                    lineJS += "";
                    break;

            }
            i += 1;
        }
        return lineJS;
    }

    // await new Promise(resolve => setTimeout(resolve, 1500));

    async evalTile(tileCode, context) {

        eval('(async (context) => {"use strict";' + tileCode + '})(context)');
        return true;
    }


    async runCode() {
        if (this.currentCodes && this.currentCodes.length > 0) {
            let parsedJS = this.declarations + this.parseCodesAsJavascript(this.currentCodes);
            //console.log(parsedJS);
            let parsedText = this.parseCodesAsText(this.currentCodes);
            document.getElementById("codes").innerHTML = parsedText;
            document.getElementById("result").innerHTML = parsedJS;
            //parsedJS = "await this.playAudio(this.sounds.A); await this.playAudio(this.sounds.B); return true";
            let parsedLines = [];
            parsedLines.push(this.evalTile(parsedJS, this));
            let done = await Promise.all(parsedLines);
        }
    }

    setupTangible() {
        //this.setVideoCanvasHeight('video-canvas');
        let tangible = this;
        // register a callback function with the TopCode library
        TopCodes.setVideoFrameCallback("video-canvas", function (jsonString) {
            // convert the JSON string to an object
            var json = JSON.parse(jsonString);
            // get the list of topcodes from the JSON object
            var topcodes = json.topcodes;
            // obtain a drawing context from the <canvas>
            var ctx = document.querySelector("#video-canvas").getContext('2d');
            // draw a circle over the top of each TopCode
            //document.querySelector("#codes").innerHTML = '';
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";   // very translucent red
            for (let i = 0; i < topcodes.length; i++) {
                ctx.beginPath();
                ctx.arc(topcodes[i].x, topcodes[i].y, topcodes[i].radius, 0, Math.PI * 2, true);
                ctx.fill();
                ctx.font = "26px Arial";
                ctx.fillText(topcodes[i].code, topcodes[i].x, topcodes[i].y);
                //console.log(topcodes[i].code +', x:'+topcodes[i].x, topcodes[i].y)
                //document.querySelector("#result").innerHTML += '<br/>' + topcodes[i].code + ', x:' + topcodes[i].x + ', y:' + topcodes[i].y;
            }

            //document.querySelector("#result").innerHTML = tangible.parseCodesAsText(topcodes);
            tangible.currentCodes = topcodes;
            tangible.once = true;


        }, this);

        // Setup buttons
        //console.log(document.getElementById('run'));
        let runButton = document.getElementById('run');
        runButton.onclick = function () {
            this.runCode();
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
        
        let cameraBtn = document.getElementById('camera-button');
        cameraBtn.onclick = function () {
            TopCodes.startStopVideoScan('video-canvas',this.mode);
        }.bind(this);
        
        let setSelect = document.getElementById('soundSets');
        setSelect.onchange = function () {
        	this.preloads(setSelect.value);
        }.bind(this);

        // Run preloads
        this.preloads("RowYourBoat");
        
        
        
    }

}