"use strict";

var canvas;
var gl;

var numVertices  = 36;
var program;

var flagDebugCam = sessionStorage.debugCam;
var videoQualityCoeff;
switch(sessionStorage.videoSetting) {
case "L":
    videoQualityCoeff = 2.0;
    break;
case "M":
    videoQualityCoeff = 4.0;
    break;
case "H":
    videoQualityCoeff = 8.0;
    break;
default:
    videoQualityCoeff = 16.0;
}

var entities= {};

var projectionMatrix , viewMatrix, modelMatrix, normalMatrix;
var near = 0.02;
var far = 30.0*videoQualityCoeff;
var fovy = 70.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;
var initialY= 3.0;
var playerOccupancyRay= 1.0;
var spawnPlayerArea= 7.0;
const up = vec3(0.0, 1.0, 0.0);
var player;
var scene;
var spotlight_lightPosition;
var spotlight_lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var spotlight_lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotlight_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var spotlight_coneDirection;
var spotlight_thetaCone = 80.0;
var spotlight_cutOff= 40.0;


var constant_attenuation= 0.001;
var linear_attenuation= 0.001;
var quadratic_attenuation= 0.005;

var materialAmbient;
if(flagDebugCam == "true"){
    materialAmbient = vec4( 0.9, 0.9, 0.9, 1.0 );
}else{
    materialAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
}

var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 ),   // cyan
    vec4( 1.0, 0.84, 0.0 , 1.0),   //gold
    vec4( 79.0/255.0, 51.0/255.0 , 23.0/255.0, 1.0), //darkBrown
    vec4( 11.0/255.0, 65.0/255.0 , 11.0/255.0, 1.0), //darkGreen
    vec4( 0.0/255.0, 38.0/255.0 , 53.0/255.0, 1.0) //sky
];



function cubeColors( index ) {
    var colors_array= [];

    for (var i = 0; i < 36; i++) {
    		colors_array.push(vertexColors[index]);
    }
    return colors_array;
};



function moveCallback(e){
    var movementX=
        e.movementX ||
        e.mozMovementX||
        0,
        movementY=
        e.movementY ||
        e.mozMovementY ||
        0;
    player.roll(movementY);
    player.pan(movementX);
};



function changePointerLock()
{
    if (document.pointerLockElement === canvas||
        document.mozPointerLockElement === canvas){
           document.addEventListener("mousemove", moveCallback, false);
           player.lockedState= true;
       } else {
           document.removeEventListener("mousemove", moveCallback, false);
           player.lockedState= false;
           player.forwardKey= false;
           player.backwardKey= false;
           player.leftKey= false;
           player.rightKey= false;
           player.upKey= false;
           player.downKey=false;
       }
};




window.onload = function init() {

   	canvas = document.getElementById( "gl-canvas" );

   	gl = WebGLUtils.setupWebGL( canvas );
   	if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect =  canvas.width/canvas.height;

   	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
   	gl.enable(gl.DEPTH_TEST);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

    canvas.onclick = function() {
        canvas.requestPointerLock();
        if(document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
                console.log('The pointer lock status is now locked');
        } else {
            console.log('The pointer lock status is now unlocked');
        }
    };
    scene = new Scene();
    scene.create(videoQualityCoeff);
    var freePos =scene.computeFreePosition( spawnPlayerArea, playerOccupancyRay);
    player = new Player([freePos[0], initialY, freePos[1]]);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten( scene.pointsArray ), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(scene.normalsArray ), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var spotlight_ambientProduct = mult(spotlight_lightAmbient, materialAmbient);
    var spotlight_specularProduct = mult(spotlight_lightSpecular, materialSpecular);
    var spotlight_diffuseProduct = mult(spotlight_lightDiffuse, materialDiffuse);

    gl.uniform4fv(gl.getUniformLocation(program, "spotlightAmbientProduct"),
                  flatten(spotlight_ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightSpecularProduct"),
                  flatten(spotlight_specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightDiffuseProduct"),
                  flatten(spotlight_diffuseProduct));
    gl.uniform1f(gl.getUniformLocation(program, "spotlight_thetaCone"),
                 spotlight_thetaCone);
    gl.uniform1f(gl.getUniformLocation(program, "spotlight_cutOff"),
                 spotlight_cutOff);
    gl.uniform1f(gl.getUniformLocation(program, "constant_attenuation"),
                 constant_attenuation);
    gl.uniform1f(gl.getUniformLocation(program, "linear_attenuation"),
                 linear_attenuation);
    gl.uniform1f(gl.getUniformLocation(program, "quadratic_attenuation"),
                 quadratic_attenuation);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
                 materialShininess);

    document.addEventListener('pointerlockchange',changePointerLock, false);
    document.addEventListener('mozpointerlockchange',changePointerLock , false);
    document.onkeydown = function(e) { player.keydownHook(e); };
    document.onkeyup = function(e) { player.keyupHook(e); };

    render();
};

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    player.step(scene,flagDebugCam);
    var at = player.get_at_in_world();
    modelMatrix = mat4();
    viewMatrix = lookAt(player.eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    spotlight_lightPosition= vec4(
                                player.eye[0],
                                player.eye[1],
                                player.eye[2],
                                1
                                );

    spotlight_coneDirection=normalize(  vec3(
                                            at[0]-player.eye[0],
                                            at[1]-player.eye[1],
                                            at[2]- player.eye[2]
                                            ));

    gl.uniform4fv(gl.getUniformLocation(program, "spotlightLightPosition"),
                  flatten(spotlight_lightPosition));
    gl.uniform3fv(gl.getUniformLocation(program, "spotlight_coneDirection"),
                  flatten(spotlight_coneDirection));
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "viewMatrix"), false, flatten(viewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "projectionMatrix"), false, flatten(projectionMatrix) );

    gl.uniform1f(gl.getUniformLocation(program, "flagLightOff"),
                 player.spaceKey);

    var spaceKeyPressedFlag = scene.draw( gl, viewMatrix, player.eye , player.spaceKey);
    if (spaceKeyPressedFlag != player.spaceKey){
        player.spaceKey = spaceKeyPressedFlag;
    }
    requestAnimFrame(render);

};
