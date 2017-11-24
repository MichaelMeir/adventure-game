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

	constructor(scene, text, given) {
		this.scene = scene;
		this.text = text;
		this.given = given;
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

//stats

var ScenesVisited = 0;
var timeSeconds = 0;
var timeCounting = false;

document.onload = new function() {
	log = document.getElementById("gamelog");
	addScenes();
	running = true;
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

	console.log(scenes[currentScene]);

	for(var i = 0; i < scenes[currentScene].needed.length; i++) {
		if(inventory[scenes[currentScene].needed[i]]) {
			hasItem++;
		}
	}

	if(scenes[currentScene].needed.length > hasItem) {
		if(scenes[currentScene].redirect != null) {
			error = scenes[currentScene].redirect.text;
			if(scenes[currentScene].door) {
				locked.play();
			}
			setScene(scenes[currentScene].redirect.scene);
			return;
		}
	}

	//stats

	if(scene >= 1) {
		setTime();
		ScenesVisited++;
	}else if(scene > -1 && scene < 1) {
		ScenesVisited = 0;
		timeCounting = true;
	}

	//---

	if(scenes[currentScene].door) {
		open.play();
	}

	for(var i = 0; i < scenes[currentScene].options.length; i++) {
		if(scenes[currentScene].options[i].given != null) {
			for(var j = 0; j < scenes[currentScene].options[i].given.length; j++) {
				if(scenes[currentScene].options[i].given[j] < 0) {
					inventory[-scenes[currentScene].options[i].given[j]] = false;
				}else if(scenes[currentScene].options[i].given[j] > 0){
					inventory[scenes[currentScene].options[i].given[j]] = true;
				}
			}
		}
	}

	for(var i = 0; i < scenes[currentScene].receive.length; i++) {
		if(scenes[currentScene].receive[i] < 0) {
			inventory[-scenes[currentScene].receive[i]] = false;
		}else{
			inventory[scenes[currentScene].receive[i]] = true;
		}
	}

	if(scenes[currentScene].image != "") {
		document.getElementById("view").setAttribute("src", "resources/images/" + scenes[currentScene].image);
	}else{
		document.getElementById("view").setAttribute("src", "resources/images/start.png");
	}

	if(scene <= 1) {
		log.innerHTML = "";
	}
	
	if(error != null) {
		addLine("> " + error + "\n\n" + scenes[currentScene].dialogue);
		error = null;
	}else{
		if(currentScene < 0) {
			addLine(scenes[currentScene].dialogue);
		}else{

			addLine(scenes[currentScene].dialogue.replace("{VISITED}", ScenesVisited).replace("{TIME}", getTime()));
		}
	}

	document.getElementById("options").innerHTML = "";

	for(var i = 0; i < scenes[currentScene].options.length; i++) {
		document.getElementById("options").innerHTML += "<p><a href=\"javascript:void(0)\" onclick=\"setScene(" + scenes[currentScene].options[i].scene + ")\">" + scenes[currentScene].options[i].text + " </a></p>";
	}

}

function setTime() {
	if(timeCounting) {
		timeSeconds = Date.now();
		timeCounting = false;
	}
}

function getTime() {

	var delta = Date.now() - timeSeconds;
    var seconds = Math.floor(delta / 1000);

	var timeString = "";
	var secondsRatio = (seconds/60);
	var minutes = 0;

	while(secondsRatio >= 1) {
		minutes += 1;
		secondsRatio -= 1;
	}

	timeString = minutes + " Minutes and " + Math.round(secondsRatio*60) + " Seconds";

	return timeString;
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

function addScenes() {

	var httpRequest = new XMLHttpRequest();

	addLine("ERROR: Could not find/load 'scenes.json' file!");

	httpRequest.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var json = JSON.parse(this.responseText);

			for(var i = 0; i < Object.entries(json["scenes"]).length; i++) {

				var optionsArray = [];

				for(var j = 0; j < Object.entries(json["scenes"][i]["options"]).length; j++) {
					optionsArray.push(new Redirect(
						json["scenes"][i]["options"][j]["id"],
						json["scenes"][i]["options"][j]["text"],
						Array.from(json["scenes"][i]["options"][j]["given"])));
				}

				scenes.push(new Scene(
					json["scenes"][i]["id"],
					json["scenes"][i]["sound"],
					json["scenes"][i]["image"],
					Array.from(json["scenes"][i]["needed"]),
					Array.from(json["scenes"][i]["receiving"]),
					new Redirect(
						json["scenes"][i]["redirect"]["id"],
						json["scenes"][i]["redirect"]["error"], null),
					optionsArray,
					json["scenes"][i]["dialogue"]
					));
			}
			log.innerHTML = "";
			setScene(0);
		}
	};

	httpRequest.open("GET", "scenes.json", true);
	httpRequest.send();

}

/*

	{
			"id": 0,
			"sound": false,
			"image": "",
			"needed": [],
			"receiving": [],
			"redirect": {
				"id": null,
				"error": null
			},
			"options": [
				{
					"id": 0,
					"text": "",
					"given": []
				},
				{
					"id": 0,
					"text": "",
					"given": []
				}
			],
			"dialogue": ""
		}

*/