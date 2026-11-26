/*
  storage.js - Storage helpers for Chuckie Egg
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

function createCookie(c_name,value,path,expiredays)
{
	var exdate = new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	//document.cookie=c_name+ "=" +escape(value)+((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
	document.cookie=c_name+ "=" +value+((expiredays==null) ? "" : ";expires="+exdate.toGMTString()) + ((path==null)? "" : ";path="+path);
}

// A page opened as a file cannot keep cookies. Chrome does keep localStorage
// for file:// pages, and window.name survives the Play navigation everywhere.
function readStored(c_name)
{
	var value = readCookie(c_name);
	if(value)
		return value;

	if(location.protocol != "file:")
		return "";

	try {
		value = localStorage.getItem(c_name);
		if(value)
			return value;
	} catch(e) {}

	return readLevelHandoff(c_name);
}

function readLevelHandoff(c_name)
{
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

