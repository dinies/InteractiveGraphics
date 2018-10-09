"use strict";
var flagDebugCam= false;
var videoSetting= "L" ;



function  changeColorButtons( currSetting){
    switch(currSetting) {
    case "L":
        document.getElementById("ButtonL").style.background="YellowGreen";
        document.getElementById("ButtonM").style.background="Tomato";
        document.getElementById("ButtonH").style.background="Tomato";
        document.getElementById("ButtonU").style.background="Tomato";
        break;
    case "M":
        document.getElementById("ButtonL").style.background="Tomato";
        document.getElementById("ButtonM").style.background="YellowGreen";
        document.getElementById("ButtonH").style.background="Tomato";
        document.getElementById("ButtonU").style.background="Tomato";
        break;
    case "H":
        document.getElementById("ButtonL").style.background="Tomato";
        document.getElementById("ButtonM").style.background="Tomato";
        document.getElementById("ButtonH").style.background="YellowGreen";
        document.getElementById("ButtonU").style.background="Tomato";
        break;
    default:
        document.getElementById("ButtonL").style.background="Tomato";
        document.getElementById("ButtonM").style.background="Tomato";
        document.getElementById("ButtonH").style.background="Tomato";
        document.getElementById("ButtonU").style.background="YellowGreen";
    }
};


window.onload = function init() {

    document.getElementById("ButtonP").onclick = function(){
        sessionStorage.setItem('videoSetting', videoSetting);
        sessionStorage.setItem('debugCam', flagDebugCam);
        window.location.href = 'world.html';
    };
    document.getElementById("ButtonL").onclick = function(){
        videoSetting = "L";
        changeColorButtons(videoSetting);
    };
    document.getElementById("ButtonM").onclick = function(){
        videoSetting = "M";
        changeColorButtons(videoSetting);

    };
    document.getElementById("ButtonH").onclick = function(){
        videoSetting = "H";
        changeColorButtons(videoSetting);
    };
    document.getElementById("ButtonU").onclick = function(){
        videoSetting = "U";
        changeColorButtons(videoSetting);
    };
    document.getElementById("ButtonD").onclick = function(){flagDebugCam = !flagDebugCam;console.log(flagDebugCam);};
};
