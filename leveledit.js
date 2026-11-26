/*
  leveledit.js - Level layout editor
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

var mouseDown = false;
var mouseRButton = false;
var mxpos = 0, mypos = 0;
var ctrlPressed = false;
var mouseDirLock = 0;
var clickcell = null;
var levelEditor = null;

//
// Array of all levels.
//
var g_levelLayouts = [level1, level2, level3, level4, level5, level6, level7, level8];
var g_levelHens = [level1Hens, level2Hens, level3Hens, level4Hens, level5Hens, level6Hens, level7Hens, level8Hens];
var g_levelFarmers = [level1Farmer, level2Farmer, level3Farmer, level4Farmer, level5Farmer, level6Farmer, level7Farmer, level8Farmer];
var g_levelLifts = [level1Lift, level2Lift, level3Lift, level4Lift, level5Lift, level6Lift, level7Lift, level8Lift];

function GetRadioGroupItem()
{
	var item = 0;
	var radioGroup = document.getElementsByName("group1");
	for(var i = 0; i < radioGroup.length; ++i)
	{
		if(radioGroup[i].checked)
		{
			item = i + 1; // skip blank piece
			break;
		}
	}
	return item;
}

function placeCell(x, y) 
{ 
	var item = 0;
	var le = levelEditor;

	if(mouseRButton)
	{
		item = le.blank; // Erase.
	}
	else
	{
		item = GetRadioGroupItem();
	}

	le.SetCellItem(x, y, item);
}

function IsRightMouseButton(e) 
{
	if(!e) var e = window.event

	if(parseInt(navigator.appVersion) > 3) 
	{
		var clickType = 1;
		if(navigator.appName=="Netscape") 
			clickType = e.which;
		else 
			clickType = e.button;

		return (clickType != 1);

		if(clickType == 1)
			self.status='Left button!';
		else if (clickType != 1) 
			self.status='Right button!';
	}
	return true;
}


// Deal with single click
function onDivMouseDown(e)
{
	if(!e) var e = window.event
	mouseRButton = IsRightMouseButton(e);
	ctrlPressed = (e.ctrlKey == 1)
	mxpos = e.x;
	mypos = e.y;
	clickcell = this;
	mouseDown = true; 
	placeCell(this.myX, this.myY);
	return false;
} 

function onMouseDown(e)
{
	if(!e) var e = window.event
	mouseRButton = IsRightMouseButton(e);
	ctrlPressed = (e.ctrlKey == 1)
	mxpos = e.x;
	mypos = e.y;
	clickcell = this;
	mouseDown = true; 
	return false;
}

function onMouseUp()
{
	mouseDown = false;
	ctrlPressed = false; 
	mouseDirLock = 0;
	clickcell = null;
}

function onMouseOver()
{
	this.className='cell on';

	if(mouseDown)
	{
		if(clickcell)
		{
			if(mouseDirLock == 1)
				placeCell(this.myX, clickcell.myY);
			else if(mouseDirLock == 2)
				placeCell(clickcell.myX, this.myY);
			else
				placeCell(this.myX, this.myY);
		}
		else
		{
			placeCell(this.myX, this.myY);
		}
	}
}

function onMouseOut()
{
	this.className='cell off';
}

function onMouseMove(e)
{
	if(!e) var e = window.event

	if(mouseDirLock != 0)
		return false;

	if(ctrlPressed && mouseDown)
	{
		if((mxpos - e.x) != 0 || (mypos - e.y) != 0)
		{
			if(Math.abs(mxpos - e.x) > Math.abs(mypos - e.y))
				mouseDirLock = 1; // x direction
			else
				mouseDirLock = 2; // y direction
		}

	}
	return false; // deliberately return false.
}

function createCookie(c_name,value,path,expiredays)
{
	var exdate = new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	//document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
	document.cookie=c_name+ "=" +value+((expiredays==null) ? "" : ";expires="+exdate.toGMTString()) + ((path==null)? "" : ";path="+path);
}

function readCookie(c_name)
{
	if (document.cookie.length>0)
	{
		c_start=document.cookie.indexOf(c_name + "=");
		if (c_start!=-1)
		{ 
			c_start=c_start + c_name.length+1; 
			c_end=document.cookie.indexOf(";",c_start);
			if (c_end==-1) 
				c_end=document.cookie.length;
			//return unescape(document.cookie.substring(c_start,c_end));
			return document.cookie.substring(c_start,c_end);
		} 
	}
	return "";
}

// file:// pages cannot keep cookies. localStorage holds the layouts for the
// next time the editor is opened, and window.name carries them into Play
// even in browsers that block file storage.
function readStored(c_name)
{
	var value = readCookie(c_name);
	if(value)
		return value;

	if(globalThis.location.protocol != "file:")
		return "";

	try {
		value = localStorage.getItem(c_name);
		if(value)
			return value;
	} catch(e) {}

	var stash = "";
	try { stash = globalThis.name || ""; } catch(e) { return ""; }
	var prefix = "chuckie-levels:";
	if(stash.indexOf(prefix) != 0)
		return "";
	var body = stash.substring(prefix.length);
	var splitAt = body.indexOf("\n");
	if(splitAt < 0)
		return "";
	if(c_name == "levels")
		return body.substring(0, splitAt);
	if(c_name == "chars")
		return body.substring(splitAt + 1);
	return "";
}

function writeStored(c_name, value, path, expiredays)
{
	createCookie(c_name, value, path, expiredays);
	if(globalThis.location.protocol != "file:")
		return;
	try { localStorage.setItem(c_name, value); } catch(e) {}
}

function stashLevelHandoff(levels, chars)
{
	if(globalThis.location.protocol != "file:")
		return;
	try { globalThis.name = "chuckie-levels:" + levels + "\n" + chars; } catch(e) {}
}


function LevelEditor()
{
	// Mode
	this.layoutMode = 0;
	this.characterMode = 1;
	this.currentMode = this.layoutMode;

	// Cell types
	this.blank = 0;
	this.wall = 1;
	this.grain = 2;
	this.egg = 3;
	this.ladder = 4;
	this.lift = 5;
	this.farmer = 6;
	this.hen = 7;

	this.maxHens = 8;
	this.maxLifts = 5;

	this.levelXMin = 0;
	this.levelXMax = 160;
	this.levelYMin = 0;
	this.levelYMax = 224;
	this.numXCells = 20;
	this.numYCells = 28;

	this.cellImages = ["none", 
				"url(images/wall.gif)", 
				"url(images/grain.gif)",		 
				"url(images/egg.gif)",
				"url(images/ladder.gif)",
				"url(images/lift.gif)",
				"url(images/farmer-icon.gif)",
				"url(images/hen1.gif)",
				"url(images/hen2.gif)",
				"url(images/hen3.gif)",
				"url(images/hen4.gif)",
				"url(images/hen5.gif)",
				"url(images/hen6.gif)",
				"url(images/hen7.gif)",
				"url(images/hen8.gif)"];

	this.currentLayout = 0;

	this.editableLayouts = new Array;
	this.editableLayouts.length = 8;

	this.editableHens = new Array;
	this.editableHens.length = 8;

	this.editableFarmers = new Array;
	this.editableFarmers.length = 8;

	this.editableLifts = new Array;
	this.editableLifts.length = 8;
	
	this.SetLayoutMode = function()
	{
		this.currentMode = this.layoutMode;
	}

	this.SetCharacterMode = function()
	{
		this.currentMode = this.characterMode;
	}


	this.NextLevel = function()
	{
		this.SetCurrentLayout(this.currentLayout + 1, true);
	}

	this.PrevLevel = function()
	{
		this.SetCurrentLayout(this.currentLayout - 1, true);
	}

	this.SetTextNode = function(name, value)
	{
		var elem = document.getElementById(name);
		var oTextNode = document.createTextNode(value);
		if(elem.hasChildNodes())
		{
			var oReplaceNode = elem.childNodes[0];
			if(oReplaceNode)
				elem.removeChild(oReplaceNode);
		}
		elem.appendChild(oTextNode);	
		//elem.innerText = value; // this doesn't work in firefox
	}

	// Transfer default level layout into editable layout.
	this.ResetDefaultLayout = function(levelNum)
	{
		if(levelNum < 0 || levelNum > 7)
		{
			alert("level number out of range");
			return;
		}

		// Copy array of layout data
		this.editableLayouts[levelNum] = new Array;
		var layout = this.editableLayouts[levelNum];
		var defaultLayout = g_levelLayouts[levelNum];
		for(var y = 0; y < this.numYCells; ++y)
		{
			layout[y] = new Array;
			for(var x = 0; x < this.numXCells; ++x)
			{
				layout[y][x] = defaultLayout[y][x];
			}
		}		

		// Copy hen positions
		this.editableHens[levelNum] = new Array;
		var hens = this.editableHens[levelNum];
		var defaultHens = g_levelHens[levelNum];
		for(var i = 0; i < this.maxHens; i++)
		{
			hens[i] = new Array;
			hens[i][0] = defaultHens[i][0];
			hens[i][1] = defaultHens[i][1];
		}

		// Copy farmer position
		this.editableFarmers[levelNum] = new Array;
		this.editableFarmers[levelNum][0] = g_levelFarmers[levelNum][0];
		this.editableFarmers[levelNum][1] = g_levelFarmers[levelNum][1];

		// Copy Lift positions
		this.editableLifts[levelNum] = new Array;
		var lifts = this.editableLifts[levelNum];
		var defaultLifts = g_levelLifts[levelNum];
		for(var i = 0; i < this.maxLifts; ++i)
		{
			if( i < defaultLifts.length)
				lifts[i] = defaultLifts[i];		
			else
				lifts[i] = -1;
		}
	}

	this.ResetCurrentLayout = function()
	{
		var confirmed = window.confirm("Are you sure you want to reset the layout?");
		if (!confirmed)
			return;

		this.ClearLayout();
		this.ResetDefaultLayout(this.currentLayout);
		this.SetCurrentLayout(this.currentLayout, true);
	}

	this.Load = function()
	{
		// Read from cookie.
		var cookieLevels = readStored("levels");

		var levelData = rleDecode(asciiDecode(cookieLevels));
		var offset = 0;
		for(var lev = 0; lev < 8; ++lev)
		{
			this.ResetDefaultLayout(lev); // Populate editable layout with default layout

			// The default layout to override.
			var layout = this.editableLayouts[lev];

			// otherwise use default descriptions
			if(cookieLevels==null || cookieLevels=="")
				continue;
			
			for(var y = 0; y < this.numYCells; ++y)
			{
				for(var x = 0; x < this.numXCells; ++x)
				{
					var val = levelData[offset];
					layout[y][x] = val;
					offset++;
				}
			}
		}

		var cookieChars = readStored("chars");
		if(cookieChars==null || cookieChars=="")
			return;

		offset = 0;
		for(var lev = 0; lev < 8; lev++)
		{
			var farmerPos = this.editableFarmers[lev];
			farmerPos[0] = this.decodeVal(cookieChars.charCodeAt(offset));
			farmerPos[1] = this.decodeVal(cookieChars.charCodeAt(offset+1));
			offset+=2;

			var henPos = this.editableHens[lev];
			for(var i = 0; i < this.maxHens; i++)
			{
				henPos[i][0] = this.decodeVal(cookieChars.charCodeAt(offset));
				henPos[i][1] = this.decodeVal(cookieChars.charCodeAt(offset+1));
				offset+=2;
			}

			var liftPos = this.editableLifts[lev];
			for(var i = 0; i < this.maxLifts; i++)
			{
				liftPos[i] = this.decodeVal(cookieChars.charCodeAt(offset));
				offset++;
			}
		}
	}


	// Populates the editor with the data from the chosen level number.
	this.SetCurrentLayout = function(levelNum, save)
	{
		if(levelNum > 7)
			levelNum = 7;

		if(levelNum < 0)
			levelNum = 0;

		this.SetTextNode("currlevel", (levelNum+1).toString());
		this.currentLayout = levelNum;

		this.SetLayoutMode();
		var layout = this.editableLayouts[levelNum];
		for(var y = 0; y < this.numYCells; ++y)
		{
			var row = layout[y];
			for(var x = 0; x < this.numXCells; ++x)
			{
				this.SetCellItem(x, y, row[x]);
			}
		}

		this.SetCharacterMode();
		var farmerPos = this.editableFarmers[levelNum];
		if(farmerPos[0] != -1)
		{
			this.SetCellItem(farmerPos[0], farmerPos[1]-2, this.farmer);
		}
		else
		{
			this.farmerStyleCache.visibility = "hidden";
		}

		var henPos = this.editableHens[levelNum];
		for(var i = 0; i < this.maxHens; i++)
		{
			if(henPos[i][0] == -1)
				this.henStyleCache[i].visibility = "hidden";
			else
				this.SetCellItem(henPos[i][0], henPos[i][1], this.hen + i);
		}

		var liftPos = this.editableLifts[levelNum];
		for(var i = 0; i < this.maxLifts; i++)
		{
			if(liftPos[i] == -1)
				this.liftStyleCache[i].visibility = "hidden";
			else
				this.SetCellItem(liftPos[i], 27, this.lift);
		}

	
		// Set mode based on current check box selection
		this.currentMode = (GetRadioGroupItem() >= this.lift) ? this.characterMode : this.layoutMode;

		if(save)
		{
			this.Save();
		}
	}

	this.encodeVal = function(val)
	{
		if(val == -1)
			val = 33;
		else
			val += 35;

		if(val == 59)
			val = 34;

		return String.fromCharCode(val);
	}
	this.decodeVal = function(val)
	{
		if(val == 34)
			val = 59;

		if(val == 33)
			val = -1
		else
			val -= 35;

		return val;
	}

	this.Save = function()
	{
		// Flatten level layout
		var flattened = new Array;
		for(var lev = 0; lev < 8; lev++)
		{
			var layout = this.editableLayouts[lev];
			for(var y = 0; y < this.numYCells; ++y)
			{
				var row = layout[y];
				for(var x = 0; x < this.numXCells; ++x)
				{
					flattened[flattened.length] = row[x];
				}
			}

		}


		var value = asciiEncode(rleEncode(flattened));

		// Write to cookie. On a file:// page the cookie is discarded, so also
		// keep the same string in localStorage.
		var levelsValue = value;
		writeStored("levels", value, "/", 365);

		value = "";
		for(var lev = 0; lev < 8; lev++)
		{
			var farmerPos = this.editableFarmers[lev];
			value += this.encodeVal(farmerPos[0]);
			value += this.encodeVal(farmerPos[1]);

			var henPos = this.editableHens[lev];
			for(var i = 0; i < this.maxHens; i++)
			{
				value += this.encodeVal(henPos[i][0]);
				value += this.encodeVal(henPos[i][1]);
			}

			var liftPos = this.editableLifts[lev];
			for(var i = 0; i < this.maxLifts; i++)
			{
				value += this.encodeVal(liftPos[i]);
			}
		}
		writeStored("chars", value, "/", 365);
		stashLevelHandoff(levelsValue, value);
	}

	this.ClearCurrentLayout = function()
	{
		var confirmed = window.confirm("Are you sure you want to clear the layout?");
		if (!confirmed)
			return;

		this.ClearLayout(this.currentLayout);
		this.Save();
	}

	this.ClearLayout = function()
	{
		this.SetLayoutMode();
		for(var y = 0; y < this.numYCells; ++y)
		{
			for(var x = 0; x < this.numXCells; ++x)
			{
				this.SetCellItem(x, y, this.blank);
			}
		}
		this.SetCharacterMode();

		// Eliminate lifts, farmers and hens.
		var henPos = this.editableHens[this.currentLayout];
		for(var i = 0; i < this.maxHens; i++)
		{
			this.henStyleCache[i].visibility = "hidden";
			henPos[i][0] = -1;
			henPos[i][1] = -1;
		}

		var liftPos = this.editableLifts[this.currentLayout];
		for(var i = 0; i < this.maxLifts; i++)
		{
			this.liftStyleCache[i].visibility = "hidden";
			liftPos[i] = -1;
		}

		this.farmerStyleCache.visibility = "hidden";
		var farmerPos = this.editableFarmers[this.currentLayout];
		farmerPos[0] = -1;
		farmerPos[1] = -1;

		// Set mode based on current check box selection
		this.currentMode = (GetRadioGroupItem() >= this.lift) ? this.characterMode : this.layoutMode;
	}

	this.SetCellItem = function(x, y, item)
	{	
			switch(item)
			{
			case this.blank:
				if(this.currentMode == this.characterMode)
				{
					var farmerPos = this.editableFarmers[this.currentLayout];
					if(farmerPos[0] == x && farmerPos[1] == (y+2))
					{
						this.farmerStyleCache.visibility = "hidden";
						var farmerPos = this.editableFarmers[this.currentLayout];
						farmerPos[0] = -1;
						farmerPos[1] = -1;
					}

					var liftPos = this.editableLifts[this.currentLayout];
					for(var i = 0; i < this.maxLifts; i++)
					{
						if(liftPos[i] == x && y == 27)
						{
							this.liftStyleCache[i].visibility = "hidden";
							liftPos[i] = -1;
						}
					}
					
					var henPos = this.editableHens[this.currentLayout];
					for(var i = 0; i < this.maxHens; i++)
					{
						if(henPos[i][0] == x && henPos[i][1] == y)
						{
							this.henStyleCache[i].visibility = "hidden";
							henPos[i][0] = -1;
							henPos[i][1] = -1;
						}
					}

					return;
				}
				// Otherwise fall through
			case this.wall:
			case this.grain:
			case this.egg:
			case this.ladder:
				var cacheStyle = this.levelStyleCache[y][x];
				cacheStyle.backgroundImage = this.cellImages[item];
		
				var layout = this.editableLayouts[this.currentLayout];
				layout[y][x] = item;

				cacheStyle.left = (x<<4);
				cacheStyle.top = (y<<3);
				cacheStyle.width = 16;
				cacheStyle.height = 8;
				cacheStyle.zIndex = 1;
				cacheStyle.marginLeft = 0;
				break;

			case this.lift:
				var liftPos = this.editableLifts[this.currentLayout];
				// Find a slot
				for(var i = 0; i < this.maxLifts; i++)
				{
					if(liftPos[i] == x) // Already exists
						break; // re-position or make visible

					if(liftPos[i] == -1)
						break;
				}
				if(i < this.maxLifts)
				{
					liftPos[i] = x;
					var liftStyle = this.liftStyleCache[i];
					liftStyle.visibility = "visible";
					liftStyle.left = (x<<4)+6;
					liftStyle.top = (27<<3);
				}
				break;

			case this.farmer:
				var farmerPos = this.editableFarmers[this.currentLayout];
				farmerPos[0] = x;
				farmerPos[1] = y+2;
				var farmerStyle = this.farmerStyleCache;
				farmerStyle.visibility = "visible";
				farmerStyle.left = (x<<4) - 8; 
				farmerStyle.top = (y<<3) - 8;
				break;

			default:
				var idx = (item - this.hen);
				var henPos = this.editableHens[this.currentLayout];
				henPos[idx] = new Array;
				henPos[idx][0] = x;
				henPos[idx][1] = y;
				var henStyle = this.henStyleCache[idx];
				if(!henStyle) alert(item);
				henStyle.visibility = "visible";
				henStyle.left = (x<<4); 
				henStyle.top = (y<<3) - 13; 
				break;
			};
	}


	this.Init = function()
	{
		// Set mode based on current check box selection
		this.currentMode = (GetRadioGroupItem() >= this.lift) ? this.characterMode : this.layoutMode;

		// Look for cookies containing level data and use them to override default layouts.
		this.Load();

		//
		// Initialise table cells for level layout.
		//
		this.levelStyleCache = new Array;
		for(var y = 0; y < this.numYCells; ++y)
		{
			this.levelStyleCache[y] = new Array;
			for(var x = 0; x < this.numXCells; ++x)
			{
				this.levelStyleCache[y][x] = null;
			}
		}

		var topLevelDiv = document.getElementById("maindiv");
		var levDiv = document.createElement("DIV");
		levDiv.id = "levelDiv";
		levDiv.style.position = "relative";
		levDiv.style.width = this.levelXMax<<1;
		levDiv.style.height = this.levelYMax;
		//levDiv.style.zIndex = 2;
		topLevelDiv.appendChild(levDiv);

		for(var y = 0; y < this.numYCells; ++y)
		{
			var row = this.levelStyleCache[y];
			for(var x = 0; x < this.numXCells; ++x)
			{
				var newElem = document.createElement("DIV");
				newElem.className="cell off";
				newElem.style.left = x<<4;
				newElem.style.top = y<<3;
				newElem.style.width = 16;
				newElem.style.height = 8;
				newElem.style.zIndex = 1;
				newElem.style.opacity = 1;
				newElem.onmouseover = onMouseOver;
				newElem.onmouseout = onMouseOut;
				newElem.onmousedown = onDivMouseDown;
				newElem.onmousemove = onMouseMove; 
				newElem.onmouseup = onMouseUp;
				newElem.myX = x;
				newElem.myY = y;
				levDiv.appendChild(newElem);
				row[x] = newElem.style;
			}
		} 

		this.henStyleCache = new Array;
		for(var i = 0; i < this.maxHens; i++)
		{
			var newElem = document.createElement("DIV");
			newElem.className="cell";
			newElem.style.width = 16;
			newElem.style.height = 20;
			newElem.style.visibility = "hidden";
			newElem.style.backgroundImage = this.cellImages[this.hen + i];
			newElem.style.zIndex = -1;
			levDiv.appendChild(newElem);
			this.henStyleCache[i] = newElem.style;
		}

		this.liftStyleCache = new Array;
		for(var i = 0; i < this.maxLifts; i++)
		{
			var newElem = document.createElement("DIV");
			newElem.className="cell";
			newElem.style.width = 32 - 6;
			newElem.style.height = 4;
			newElem.style.visibility = "hidden";
			newElem.style.backgroundImage = this.cellImages[this.lift];
			newElem.style.zIndex = -1;
			levDiv.appendChild(newElem);
			this.liftStyleCache[i] = newElem.style;
		}

		var newElem = document.createElement("DIV");
		newElem.className="cell";
		newElem.style.width = 24;
		newElem.style.height = 16;
		newElem.style.visibility = "hidden";
		newElem.style.backgroundImage = this.cellImages[this.farmer];
		newElem.style.zIndex = -1;
		levDiv.appendChild(newElem);
		this.farmerStyleCache = newElem.style;

		this.currentLayout = 0;
		this.SetCurrentLayout(this.currentLayout, false);
	};

	this.generateCode = function()
	{
		var str = "";
		for(var level = 0; level < 8; ++level)
		{
			str += "var level" + (level+1) + "=[\n";
			var layout = this.editableLayouts[level];
			for(var y = 0; y < this.numYCells; ++y)
			{
				var row = layout[y];
				str += "[";
				for(var x = 0; x < this.numXCells; ++x)
				{
					switch(row[x])
					{
						case this.blank:
						case this.wall:
						case this.ladder:
						case this.egg:
						case this.grain:
							str += row[x].toString();
							break;
					};
					if(x < (this.numXCells-1))
						str += ",";
				}
				str += "]";
				if(y < (this.numYCells-1))
					str += ",";
				str += "\n";
			} 
			str += "];\n\n";

			str += "var level" + (level+1) + "Hens = \n";
			str += "[\n";
			var henPositions = this.editableHens[level];
			for(var i = 0; i < this.maxHens; ++i)
			{
				if(henPositions[i] != null)
					str += "[" + henPositions[i][0] + ", " + henPositions[i][1] + "]";
				else
					str += "[-1, -1]";
				if( i < (this.maxHens-1))
					str += ",";
				str += "\n";
			}
			str += "];\n";
			str += "var level" + (level+1) + "Farmer = [" + this.editableFarmers[level][0] + ", " + this.editableFarmers[level][1] + "];\n";
			str += "var level" + (level+1) + "Lift = [";
			var lifts = this.editableLifts[level];
			for(var i = 0; i < this.maxLifts; ++i)
			{
				str += lifts[i];
				if(i < (this.maxLifts-1))
					str += ",";
			}
			str += "];\n";
		}
		this.SetTextNode("leveldesc", str);
	}

	// Perform basic checks necessary for a level to work properly in Chuckie Egg.
	this.ValidateLayout = function(levelNum)
	{
		if(levelNum < 0 || levelNum > 7)
		{
			alert("level number out of range");
			return;
		}

		var bHasFarmer = (this.editableFarmers[levelNum][0] != -1);
		var henPos = this.editableHens[levelNum];
		var bHasHen = false;
		for(var i = 0; i < this.maxHens; i++)
		{
			if(henPos[i][0] != -1)
			{
				bHasHen = true;
				break;
			}
		}
			
		var value = "";
		var eggCount = 0;
		var layout = this.editableLayouts[levelNum];
		for(var y = 0; y < this.numYCells; ++y)
		{
			var row = layout[y];
			for(var x = 0; x < this.numXCells; ++x)
			{
				value += row[x].toString();
				if(row[x] == this.egg)
					eggCount++;
			}
		}
	

		if(eggCount != 12)
		{
			alert("Level " + levelNum + ": You must define a dozen eggs.");
			return false;
		}

		if(!bHasFarmer)
		{
			alert("Level " + levelNum + ": No farmer position has been defined.");
			return false;
		}

		if(!bHasHen)
		{
			alert("Level " + levelNum + ": You must define at least one hen position.");
			return false;
		}

		return true;
	}

	// Only valid layouts are made available to play
	this.ValidateLevels = function()
	{
		for(var level = 0; level < 8; ++level)
		{
			if(!this.ValidateLayout(level))
				return false;
		}

		return true;
	}

	this.Play = function(url)
	{
		if(!this.ValidateLevels())
			return;
		
		this.Save();
		window.location = url;
	}
};

function save()
{
	if(levelEditor)
	{
		levelEditor.Save();
	}
}


function go()
{

	if(parseInt(navigator.appVersion) > 3) 
	{
		document.onmouseup = onMouseUp;
		if (navigator.appName =="Netscape") 
			document.captureEvents(Event.MOUSEDOWN);
	}

	levelEditor = new LevelEditor();
	levelEditor.Init();

};
