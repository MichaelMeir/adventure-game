class Scene {
	
	constructor(scene, door, image, needed, receive, redirect, options, dialogue) {
		this.scene = scene;
		this.door = door;
		this.image = image;
		this.needed = needed;
		this.receive = receive;
		this.redirect = redirect;
		this.options = options;
		this.dialogue = dialogue;
	}
}

class Redirect {

	constructor(scene, text) {
		this.scene = scene;
		this.text = text;
	}
}

var inventory = [];

var log;

var scenes = new Array();
var currentScene;

var open = new Audio("resources/audio/terminal/ui_hacking_passgood.wav");
var locked = new Audio("resources/audio/terminal/ui_hacking_passbad.wav");

var error = null;

var letter = 0;
var splitLine;
var typing;

var running;

var showing;

var currentTime = 0;
var lastTime = 0;

document.onload = new function() {
	log = document.getElementById("gamelog");
	addScenes();
	setScene(0);
	cursor();

	open.volume = 0.2;
	locked.volume = 0.2;
}

function setScene(scene) {
	for(var i = 0; i < scenes.length; i++) {
		if(scenes[i].scene == scene) {
			currentScene = i;
		}
	}

	console.log(scene);

	var hasItem = 0;

	for(var i = 0; i < scenes[currentScene].needed.length; i++) {
		if(inventory[scenes[currentScene].needed[i]]) {
			hasItem++;
		}
	}

	if(scenes[currentScene].needed.length > hasItem) {
		error = scenes[currentScene].redirect.text;
		if(scenes[currentScene].door) {
			locked.play();
		}
		setScene(scenes[currentScene].redirect.scene);
		return;
	}

	if(scenes[currentScene].door) {
		open.play();
	}

	for(var i = 0; i < scenes[currentScene].receive.length; i++) {
		if(scenes[currentScene].receive[i] < 0) {
			inventory[-scenes[currentScene].receive[i]] = false;
		}else{
			inventory[scenes[currentScene].receive[i]] = true;
		}
	}

	document.getElementById("view").setAttribute("src", "resources/images/" + scenes[currentScene].image);

	if(scene == 1) {
		log.innerHTML = "";
	}
	
	if(error != null) {
		addLine("> " + error + "\n\n" + scenes[currentScene].dialogue);
		error = null;
	}else{
		addLine(scenes[currentScene].dialogue);
	}

	document.getElementById("options").innerHTML = "";

	for(var i = 0; i < scenes[currentScene].options.length; i++) {
		for(var j = 0; j < scenes.length; j++) {
			if(scenes[currentScene].options[i].scene == scenes[j].scene) {
				document.getElementById("options").innerHTML += "<a href=\"javascript:void(0)\" onclick=\"setScene(" + scenes[currentScene].options[i].scene + ")\">" + scenes[currentScene].options[i].text + " </a>";
			}
		}
	}

}

function animation(timeStamp) {
	if(splitLine.length > letter) {

		if(currentScene >= 0) {
			if(typing.currentTime > 0.4) {
				typing.pause();
				var random = Math.floor((Math.random() * 4) + 1);
				typing = new Audio("resources/audio/terminal/char/multiple/ui_hacking_charmultiple_0" + random + ".wav");
				typing.volume = 0.2;
				typing.currentTime = 0;
				typing.play();
			}
		}

		var split = log.innerHTML.split("▋");
		log.innerHTML = split[0] + splitLine[letter] + "▋";
		letter++;
		log.scrollTop = log.scrollHeight;
		requestAnimationFrame(animation);
	}else{
		typing.pause();
		typing.currentTime = 0;
	}
}

function cursor(timeStamp) {
	currentTime = (timeStamp - lastTime);
	if(running && currentTime > 500) {
		lastTime = timeStamp;
		if(showing) {
			if(!log.innerHTML.includes("▋")) {
				log.innerHTML += "▋";
			}
		}else{
			log.innerHTML = log.innerHTML.replace(/▋/g, "");
		}
		showing = !showing;
	}
	requestAnimationFrame(cursor);
}

function addLine(line) {
	line = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n" + line;
	splitLine = line.split("");
	letter = 0;
	if(typing == null) {
		typing = new Audio("resources/audio/terminal/char/multiple/ui_hacking_charmultiple_01.wav");
		typing.volume = 0.2;
	}
	typing.play();
	animation(0);
}

function addScenes() {

	//scenes.push(new Screne(A, B, "C", [D], [E], new Redirect(F), [G], "H"));
	/*
	-----------------------------------------------------------------------
		A - Scene ID, 							INTEGER
		B - Door,								BOOLEAN
		C - Scene Image, 						STRING
		D - Items Needed, 						INTEGER - ARRAY
		E - Items Receiving, 					INTEGER - ARRAY
		F - Redirect When Access Declined,		REDIRECT - OBJECT(INTEGER, STRING)
		G - Options, 							REDIRECT - OBJECT(INTEGER, STRING) - ARRAY
		H - Dialogue When Accessed,				STRING
	-----------------------------------------------------------------------
	*/

	//STORY
	scenes.push(new Scene(0, false, "start.png", [], [-1, -2, -3, -4], new Redirect(0, ""), [new Redirect(1, "Start!")], "**************************************************\nWelcome!\nThis game currently only has a test dialogue, an\nactual story will be added later!"));
	scenes.push(new Scene(1, true, "", [], [1, 2], new Redirect(0, ""), [new Redirect(2, "Quest 1."), new Redirect(3, "Quest 2.")], "Quest?"));
	scenes.push(new Scene(2, false, "", [], [-2], new Redirect(0, ""), [new Redirect(4, "Search bushes."), new Redirect(6, "Continue")], "Quest 1."));
	scenes.push(new Scene(3, false, "", [], [-1], new Redirect(0, ""), [new Redirect(5, "Search bushes."), new Redirect(7, "Continue")], "Quest 2."));

	scenes.push(new Scene(4, true, "", [1], [3, -1], new Redirect(2, "You didnt find anything in the bush."), [new Redirect(2, "return.")], "You found a shoe."));
	scenes.push(new Scene(5, true, "", [2], [4, -2], new Redirect(3, "You didnt find anything in the bush."), [new Redirect(3, "return.")], "You found a glove."));

	scenes.push(new Scene(6, true, "", [3], [], new Redirect(2, "You couldnt go this way."), [new Redirect(0, "Restart!")], "You continued!"));
	scenes.push(new Scene(7, true, "", [4], [], new Redirect(3, "You couldnt go this way."), [new Redirect(0, "Restart!")], "You continued!"));

}