/*
  gui.js - Gui implementation for Chuckie Egg
  Copyright (C) 2007 Mark Lomas

  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

// All GUI states.
var g_stateHighScores = 0;
var g_stateInGame = 1;
var g_stateRedefineKeys = 2;
var g_stateNumPlayers = 3;
var g_stateGetReady = 4;
var g_stateGameOver = 5;
var g_stateKeys = 6;
var g_statePreview = 7;
var g_stateEnterName = 8;


function GUIStateHighScores(guiObj)
{
	this.state = g_stateHighScores;
	this.guiObj = guiObj;
	this.timeOut = g_frequency*5; // three second
	this.timer = 0;
	
	this.PadScore = function(val)
	{
		// Pad string at start of number to make it 7 characters in length
		var str = val.toString();
		while(str.length < 7)
			str = " " + str;

		return str;
	}

	this.Enter = function() 
	{
		this.guiObj.DisplayBanner();
		 
		var lineSpacing = 5;
		var str = "HIGH SCORES";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, 7*8 - 1);

		var ypos = 10*8 - 2;
		for(var i = 0; i < gui.highScoreTable.maxHighScores; ++i)
		{
			var scoreAndName = gui.highScoreTable.GetScore(i);
			var str = (i+1).toString() + " " + this.PadScore(scoreAndName[0]);
			str += " " + scoreAndName[1];
			this.guiObj.Print(str, 'lime', (i == (gui.highScoreTable.maxHighScores-1)) ? 1*16-4 : 2*16-4, ypos);
			ypos += (8 + lineSpacing);
		}
		
		ypos = 29*8 - 2;
		this.guiObj.Print("Press", 'yellow', 2*16, ypos);
		this.guiObj.Print("S", 'cyan', 8*16, ypos);
		this.guiObj.Print("to start", 'yellow', 10*16, ypos);

		ypos += (8 + lineSpacing);
		this.guiObj.Print("K", 'cyan', 2*16, ypos);
		this.guiObj.Print("to change keys", 'yellow', 4*16, ypos);
	    
		this.timer = this.timeOut;
	}	
	this.Exit = function() 
	{ 
		this.guiObj.ClearScreen();
		return 0; 
	}	
	this.Update = function()
	{
		var cacheKeyboard = keyboard;
		var result = this.state;
		if(cacheKeyboard.start)
			result = g_stateNumPlayers;
		else if (cacheKeyboard.redefine)
			result = g_stateRedefineKeys;
		cacheKeyboard = null;
		
		--this.timer;
		if(this.timer > 0)
			return result;
		
		return g_statePreview;
	}
}

function GUIStateEnterName(guiObj)
{
	this.state = g_stateEnterName;
	this.guiObj = guiObj;
	this.keyReleased = false;
	this.playersName = "";
        this.score = 0;
	this.position = 0;
	this.nameEntry = null;
	this.nameEntryXPos = 0;
	this.nameEntryYPos = 0;

	this.PadScore = function(val)
	{
		// Pad string at start of number to make it 7 characters in length
		var str = val.toString();
		while(str.length < 7)
			str = " " + str;

		return str;
	}

	this.Enter = function(score) 
	{
		this.timer = this.timeOut;
		this.playersName = "";
		this.score = score;

		this.position = gui.highScoreTable.InsertScore(this.score);

		var lineSpacing = 5;
		var str = "HIGH SCORES";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, 7*8 - 1);

		var ypos = 10*8 - 2;
		for(var i = 0; i < gui.highScoreTable.maxHighScores; ++i)
		{
			var scoreAndName = gui.highScoreTable.GetScore(i);
			var str = (i+1).toString() + " " + this.PadScore(scoreAndName[0]);
			if(i == this.position)
			{
				this.guiObj.Print(str, 'lime', (i == (gui.highScoreTable.maxHighScores-1)) ? 1*16-4 : 2*16-4, ypos);
				this.guiObj.Print(">", 'yellow', (i == (gui.highScoreTable.maxHighScores-1)) ? 10*16-4 : 11*16-4, ypos);
				this.nameEntryXPos = (i == (gui.highScoreTable.maxHighScores-1)) ? 11*16-4 : 12*16-4;
				this.nameEntryYPos = ypos;
				this.nameEntry = this.guiObj.CreateNameEntry('yellow', this.nameEntryXPos, this.nameEntryYPos);
			}
			else
			{
				str += " " + scoreAndName[1];
				this.guiObj.Print(str, 'lime', (i == (gui.highScoreTable.maxHighScores-1)) ? 1*16-4 : 2*16-4, ypos);
			}
			ypos += (8 + lineSpacing);
		}

		ypos = 28*8 - 2;
		str = "ENTER YOUR NAME";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, ypos);
		ypos += (8 + lineSpacing);
		str = "Player " + (game.currentPlayer + 1); // Indexed from zero
		this.guiObj.Print(str, 'magenta', (20 - str.length)<<3, ypos);

		// The user is temped to press backspace to delete a character, but this
		// will browse back a page loosing their score :-(
		keyboard.DisableBackspace();
	}	

	this.Exit = function() 
	{
		this.guiObj.ClearScreen();
		keyboard.EnableBackspace();
		return 0;
	}
	
	this.Update = function()
	{
		var keyCode = keyboard.GetCurrentKeyCode();
		
		// Ensure that any keys have been released before allowing user input.
		if(!this.keyReleased)
		{
			if(keyCode == -1)
				this.keyReleased = true;
			else
				return this.state;
		}
		
		// Sorry, no key pressed this time round.
		if(keyCode == -1)
			return this.state;

		this.keyReleased = false;

		// Has player finished entering their name?
		if(keyCode == 13)
		{
			gui.highScoreTable.SetName(this.position, this.playersName);

			// If this was the last player, the game is over.
			if(game.GameOver())
			{
				game.Exit();
				return g_stateHighScores;
			}

			// Some players still have lives, so game remains in progress.
			game.AdvancePlayer();
			return g_stateGetReady;
		}
		
		if(keyCode == 46) // delete key pressed
		{
			if(this.playersName.length > 0)
				this.playersName = this.playersName.substr(0,this.playersName.length-1);
		}
		else
		{
			// Maximum of eight characters are allowed.
			if(this.playersName.length == 8)
				return this.state;

			if(keyCode >= 32 && keyCode < 127)
				this.playersName += String.fromCharCode(keyCode);
		}

		this.guiObj.SetNameEntry(this.nameEntry, this.playersName, this.nameEntryXPos, this.nameEntryYPos);

		return this.state;
	}
}

function GUIStatePreview(guiObj)
{
	this.state = g_statePreview;
	this.guiObj = guiObj;
	this.timeOut = g_frequency*5; // three second
	this.timer = 0;
	this.fromWhere = 0;
	
	this.Enter = function(fromWhere)
	{
		this.fromWhere = fromWhere;
		game.Init(1 + Math.floor(Math.random()*4));
		game.SelectLevel(Math.floor(Math.random()*9));
		game.DecrementLives();
		document.getElementById("gamediv").style.visibility = "visible";
		this.guiObj.guiDiv.style.visibility = "hidden";
		this.timer = this.timeOut;
	}
	
	this.Exit = function(guiObj)
	{
		document.getElementById("gamediv").style.visibility = "hidden";
		game.Exit();
		this.guiObj.guiDiv.style.visibility = "visible";
		return 0;
	}

	this.Update = function() 
	{ 
		var cacheKeyboard = keyboard;
		var result = this.state;
		if(cacheKeyboard.start)
			result = g_stateNumPlayers;
		else if (cacheKeyboard.redefine)
			result = g_stateRedefineKeys;
		cacheKeyboard = null;

		--this.timer;
		if(this.timer > 0)
			return result;

		if(this.fromWhere == 0)
			return g_stateKeys;

		return g_stateHighScores;	
	}
}


function GUIStateInGame(guiObj)
{
	this.state = g_stateInGame;
	this.guiObj = guiObj;
	this.Enter = function(numPlayers)
	{
		document.getElementById("gamediv").style.visibility = "visible";
		this.guiObj.guiDiv.style.visibility = "hidden";
	}
	
	this.Exit = function(guiObj)
	{
		return 0;
	}

	this.Update = function() 
	{ 
		var result = game.Update();
		if(result == 0)
			return this.state;
		else if(result == 1) // next player's turn
		{
			if(game.PlayerIsOut())
				return g_stateGameOver;	// Don't hide the game div, because the game over message is an overlay

			document.getElementById("gamediv").style.visibility = "hidden";
			game.AdvancePlayer();
			return g_stateGetReady;
		}
		else if(result == 2) // Escape + H was pressed to exit back to GUI
		{
			document.getElementById("gamediv").style.visibility = "hidden"; // Hide the game.
			game.Exit();
			this.guiObj.guiDiv.style.visibility = "visible";
			return g_stateHighScores; 
		}
	}
}

function GUIStateKeys(guiObj)
{
	this.state = g_stateKeys;
	this.guiObj = guiObj;
	this.ctrlStrings = ["   Up ..", " Down ..", " Left ..", "Right ..", " Jump .."];
	this.ypos = (10<<3);
	this.spacing = (2<<3) + 4;
	this.timeOut = g_frequency*5; // three second
	this.timer = 0;
	
	this.Enter = function()
	{
		this.guiObj.DisplayBanner();
	
		var str = "KEYS";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, (6<<3) + 7);

		var keyCodes = new Array;		
		var cacheKeyboard = keyboard;
		keyCodes[0] = cacheKeyboard.GetUpCode();
		keyCodes[1] = cacheKeyboard.GetDownCode();
		keyCodes[2] = cacheKeyboard.GetLeftCode();
		keyCodes[3] = cacheKeyboard.GetRightCode();
		keyCodes[4] = cacheKeyboard.GetJumpCode();
		
		this.ypos = (10<<3);
		for(var i = 0; i < keyCodes.length; ++i)
		{
			this.guiObj.Print(this.ctrlStrings[i], 'cyan', 0, this.ypos);
			this.guiObj.Print("'" + cacheKeyboard.GetKeyCodeString(keyCodes[i]) + "'", 'cyan', (9<<4), this.ypos);
			this.ypos += this.spacing;			
		}
		
		var lineSpacing = 5;
		this.ypos += lineSpacing;
		this.guiObj.Print(" Hold .. 'H'", 'magenta', 0, this.ypos);
		this.ypos += this.spacing;	
		this.guiObj.Print("Abort .. Escape +'H'", 'magenta', 0, this.ypos);
		
		ypos = 29*8 - 2;
		this.guiObj.Print("Press", 'yellow', 2*16, ypos);
		this.guiObj.Print("S", 'cyan', 8*16, ypos);
		this.guiObj.Print("to start", 'yellow', 10*16, ypos);

		ypos += (8 + lineSpacing);
		this.guiObj.Print("K", 'cyan', 2*16, ypos);
		this.guiObj.Print("to change keys", 'yellow', 4*16, ypos);

		this.timer = this.timeOut;
	}
	this.Exit = function() { this.guiObj.ClearScreen();	return 1; }
	this.Update = function()
	{
		var cacheKeyboard = keyboard;
		var result = this.state;
		if(cacheKeyboard.start)
			result = g_stateNumPlayers;
		else if (cacheKeyboard.redefine)
			result = g_stateRedefineKeys;
		cacheKeyboard = null;

		--this.timer;
		if(this.timer > 0)
			return result;

		return g_statePreview;
	}
}

function GUIStateRedefineKeys(guiObj)
{
	this.state = g_stateRedefineKeys;
	this.guiObj = guiObj;
	this.ypos = (10<<3);
	this.spacing = (2<<3) + 4;
	this.keyReleased = false;
	this.keyCodes = new Array;
	this.numKeyCodesEntered = 0;
	this.ctrlStrings = ["   Up ..", " Down ..", " Left ..", "Right ..", " Jump .."];
	this.timeOut = g_frequency; // one second
	this.timer = 0;
	
	this.Enter = function() 
	{ 
		this.numKeyCodesEntered = 0;
		this.ypos = (10<<3);

		var str = "K E Y";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, (2<<3) + 2);
		str = "S E L E C T I O N";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, (5<<3) + 3);

		this.guiObj.Print(this.ctrlStrings[this.numKeyCodesEntered], 'magenta', 0, this.ypos);
	    
		// Ensure 'K' key has been release on entry to this gui page.
		this.keyReleased = false;
	}
	this.Exit = function() { this.guiObj.ClearScreen(); return 0; }
	this.Update = function()
	{
		if(this.timer > 0)
		{
			--this.timer;
			if(this.timer > 0)
				return this.state;

			var cacheKeyboard = keyboard;
			cacheKeyboard.SetUpCode(this.keyCodes[0]);
			cacheKeyboard.SetDownCode(this.keyCodes[1]);
			cacheKeyboard.SetLeftCode(this.keyCodes[2]);
			cacheKeyboard.SetRightCode(this.keyCodes[3]);
			cacheKeyboard.SetJumpCode(this.keyCodes[4]);
			cacheKeyboard.Save();

			return g_stateHighScores;
		}
	
		var keyCode = keyboard.GetCurrentKeyCode();
		
		if(!this.keyReleased)
		{
			if(keyCode == -1)
				this.keyReleased = true;
			else
				return this.state;
		}
			
		if(keyCode == -1)
			return this.state;

		// Skip reserved keys (Escape and H)
		if(keyCode == 27 || keyCode == 'H')
			return this.state;
			
		var i = 0;
		// Ensure key has not be used already...
		for(; i < this.numKeyCodesEntered; ++i)
		{
			if(this.keyCodes[i] == keyCode)
				break;
		}
		
		if(i == this.numKeyCodesEntered)
		{
			this.keyCodes[this.numKeyCodesEntered] = keyCode;
			this.guiObj.Print("'" + keyboard.GetKeyCodeString(keyCode) + "'", 'magenta', (9<<4), this.ypos);
			++this.numKeyCodesEntered;

			if(this.numKeyCodesEntered == 5)
				this.timer = this.timeOut;
			else
			{
				this.ypos += this.spacing;
				this.guiObj.Print(this.ctrlStrings[this.numKeyCodesEntered], 'magenta', 0, this.ypos);
			}
		}
		
			
		return this.state;
	}	
}

function GUIStateNumPlayers(guiObj)
{
	this.state = g_stateNumPlayers;
	this.guiObj = guiObj;
	this.numPlayers = 0;
	this.timeOut = g_frequency; // one second
	this.time = 0;
	
	this.Enter = function() 
	{ 
		this.numPlayers = 0; 
		var str = "How many players?  ";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, (16<<3) + 2);
	}	
	this.Exit = function() 
	{ 
		game.Init(this.numPlayers);
		game.SelectLevel(0);
		game.DecrementLives();
		this.guiObj.ClearScreen();
		return 0; 
	}
	this.Update = function()
	{
		if(this.numPlayers)
		{
			--this.timer;
			if(this.timer == 0)
				return g_stateGetReady;
		}
		else
		{
			var cacheKeyboard = keyboard;
		
			if(cacheKeyboard.one)
				this.numPlayers = 1;
			else if(cacheKeyboard.two)
				this.numPlayers = 2;
			else if(cacheKeyboard.three)
				this.numPlayers = 3;
			else if(cacheKeyboard.four)
				this.numPlayers = 4;

			if(this.numPlayers)
			{
				this.timer = this.timeOut;
				this.guiObj.Print(this.numPlayers.toString(), 'yellow', 18<<4, (16<<3) + 2);
			}

			cacheKeyboard = null;
		}

		return this.state;
	}
}

function GUIStateGetReady(guiObj)
{
	this.state = g_stateGetReady;
	this.guiObj = guiObj;
	
	this.timeOut = g_frequency*3; // three seconds
	this.time = 0;
	
	this.Enter = function() 
	{ 
		this.guiObj.guiDiv.style.visibility = "visible";
		
		var str = "Get Ready";
		this.guiObj.Print(str, 'yellow', (20 - str.length)<<3, (16<<3) + 2);
		str = "Player " + (game.currentPlayer + 1); // Indexed from zero
		this.guiObj.Print(str, 'cyan', (20 - str.length)<<3, (19<<3) + 3);
		
		this.timer = this.timeOut;
	}
	this.Exit = function() 
	{ 
		this.guiObj.ClearScreen();
		return 0; 
	}
	this.Update = function()
	{
		--this.timer;
		if(this.timer > 0)
			return this.state;
			
		return g_stateInGame;
	}	
}

function GUIStateGameOver(guiObj)
{
	this.state = g_stateGameOver;
	this.guiObj = guiObj;
	
	this.timeOut = g_frequency*3; // three seconds
	this.time = 0;
	
	this.Enter = function() 
	{ 
		// Temporarily adjust GUI rectangle size.		
		var guiDivStyle = this.guiObj.guiDiv.style;
		guiDivStyle.top = (15<<3) + 2;
		var str = " GAME OVER ";
		var boxWidth = str.length;
		guiDivStyle.left = (20 - boxWidth)<<3;
		guiDivStyle.width = boxWidth<<4;
		guiDivStyle.height = 6<<3;
		guiDivStyle.visibility = "visible";
		
		str = "GAME OVER";
		this.guiObj.Print(str, 'cyan', (boxWidth - str.length)<<3, (1<<3) + 2);
		str = "Player " + (game.currentPlayer + 1); // Indexed from zero
		this.guiObj.Print(str, 'cyan', (boxWidth - str.length)<<3, (4<<3) + 3);
	    
		this.timer = this.timeOut;
	}
	this.Exit = function() 
	{ 
		this.guiObj.ClearScreen();
		return game.PlayerScore();
	}
	this.Update = function()
	{
		--this.timer;
		if(this.timer > 0)
			return this.state;
		
		document.getElementById("gamediv").style.visibility = "hidden";
		
		if(game.PlayerIsOut())
		{
			// Should player enter their name?
			if(gui.highScoreTable.CalcScorePosition(game.PlayerScore()) < gui.highScoreTable.maxHighScores)
				return g_stateEnterName;

			return g_stateHighScores;
		}
			
		game.AdvancePlayer();
		return g_stateGetReady;
	}	
}

function GUIUpdate()
{
	gui.Update();
}


function GUI()
{
	this.states = [new GUIStateHighScores(this), 
	               new GUIStateInGame(this), 
	               new GUIStateRedefineKeys(this),
	               new GUIStateNumPlayers(this),
	               new GUIStateGetReady(this),
	               new GUIStateGameOver(this),
	               new GUIStateKeys(this),
	               new GUIStatePreview(this),
                       new GUIStateEnterName(this)];
	               
	this.currentState = g_stateHighScores;
	
	this.guiDiv = null;
	this.nameEntry = null;
	this.highScoreTable = null;

	this.Init = function()
	{
		this.highScoreTable = new HighScoreTable;

		this.guiDiv = this.CreateScreen();

		// Initial state is in the highscore table.
		this.currentState = g_stateHighScores;
		this.states[this.currentState].Enter();

		var levelmanager = new LevelManager;

		levelmanager.LoadLevels(); // Initialise user-defined levels from storage if they exist.

		game = new Game(levelmanager);
	    
		this.g_nTimerId = window.setTimeout("GUIUpdate()", g_nmsec);
		this.date = new Date;
		this.ms = this.date.getTime();	
	}
    
	this.Exit = function()
	{
		window.clearInterval(this.g_nTimerId);

		delete game;
		game = null;
		delete levelmanager;
		levelmanager = null;
        
		var numStates = this.states.length;
		for(var i = 0; i < numStates; ++i)
		{
			delete this.states[i];
			this.states[i] = null;
		}

		delete this.highScoreTable;
		this.highScoreTable = null;
	}

	// http://ejohn.org/blog/accuracy-of-javascript-time/
	this.time = function()
	{
		var date = new Date;
		var newTime = date.getTime();	
		delete date;
		date = null;
		return newTime;
	}

	this.Update = function()
	{
		window.clearTimeout(this.g_nTimerId);
		this.g_nTimerId = window.setTimeout("GUIUpdate()", g_nmsec);
	
		var newState = this.states[this.currentState].Update();
		if(newState != this.currentState)
		{
			var result = this.states[this.currentState].Exit();
			this.currentState = newState;
			this.states[newState].Enter(result);
		}
	}
	
	this.DisplayBanner = function()
	{
		// Add the banner.
		var img = document.createElement("IMG");
		img.src = "images/banner2.gif";
		img.style.position = "absolute";
		img.style.top = 0;
		img.style.left = 0;
		img.style.backgroundColor = "#000000";
		this.guiDiv.appendChild(img);
	}
	
	this.Print = function(str, colour, xpos, ypos)
	{
		var strlen = str.length;
		var code;
		var xPixOffset, yPixOffset;
		
		for(var i = 0; i < strlen; ++i)
		{
			code = (str.charCodeAt(i) - 32);
			xPixOffset = (code % 20)<<4;
			yPixOffset = (Math.floor(code / 20))<<3;
			
			var img = document.createElement("IMG");
			img.src = "images/mode2font.gif";
			img.style.position = "absolute";
			img.style.top = (ypos - yPixOffset);
			img.style.left = (xpos - xPixOffset);
			img.style.clip = "rect(" + yPixOffset + "," + (xPixOffset+16) + "," + (yPixOffset+8) + "," + xPixOffset + ")"; // top right bottom left
			img.style.backgroundColor = colour;
			this.guiDiv.appendChild(img);
			xpos += (1<<4);
		}
	}

	this.CreateNameEntry = function(colour, xpos, ypos)
	{
		var nameEntry = new Array;
		var code = 0; // space
		var xPixOffset, yPixOffset;
		for(var i = 0; i < 8; ++i)
		{
			xPixOffset = (code % 20)<<4;
			yPixOffset = (Math.floor(code / 20))<<3;
			
			var img = document.createElement("IMG");
			img.src = "images/mode2font.gif";
			img.style.position = "absolute";
			img.style.top = (ypos - yPixOffset);
			img.style.left = (xpos - xPixOffset);
			img.style.clip = "rect(" + yPixOffset + "," + (xPixOffset+16) + "," + (yPixOffset+8) + "," + xPixOffset + ")"; // top right bottom left
			img.style.backgroundColor = colour;
			this.guiDiv.appendChild(img);
			xpos += (1<<4);
			nameEntry[i] = img;
		}
		return nameEntry;
	}

	this.SetNameEntry = function(nameEntry, str, xpos, ypos)
	{
		var xPixOffset, yPixOffset;
		for(var i = 0; i < 8; ++i)
		{
			if(i < str.length)
				var code = (str.charCodeAt(i) - 32);
			else
				var code = 0;

			xPixOffset = (code % 20)<<4;
			yPixOffset = (Math.floor(code / 20))<<3;
			nameEntry[i].style.top = (ypos - yPixOffset);
			nameEntry[i].style.left = (xpos - xPixOffset);
			nameEntry[i].style.clip = "rect(" + yPixOffset + "," + (xPixOffset+16) + "," + (yPixOffset+8) + "," + xPixOffset + ")"; // top right bottom left
			xpos += (1<<4);
		}
	}

	this.CreateScreen = function()
	{
		var outerDiv = document.getElementById("outerdiv");
		var screen = document.createElement("DIV");
		screen.style.position = "absolute";
		screen.style.width = screenWidth<<1;
		screen.style.height = screenHeight;
		screen.style.backgroundColor = "#000000";
		outerDiv.appendChild(screen);
		return screen;
	}
    
	this.ClearScreen = function()
	{
		var temp = this.CreateScreen();
		if(this.guiDiv != null)
		{
			var outerDiv = document.getElementById("outerdiv");
			outerDiv.removeChild(this.guiDiv);
			this.guiDiv = null;
		}
		this.guiDiv = temp;
	}
}
