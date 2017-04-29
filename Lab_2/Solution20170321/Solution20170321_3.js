"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4( 0.5, -0.5, 0.5, 1.0)
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];


var near = 0.3;
var far = 5.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var zEye = 3.0;
var yAt = 0.0;
var eye = vec3(0.0, 0.0, zEye);
var at = vec3(0.0, yAt, 0.0);
var upY = true;
var up = vec3(0.0, 1.0, 0.0);

var rotate;
var scale;
var trans;
var mat;

var angleTop = 0.0;
var angleBottom = 0.0;
var topSpeed = 0.0;
var bottomSpeed = 0.0;

var persp = true;
var upRotate = true;
var bottomRotate = true;

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// sliders for viewing parameters

    document.getElementById("switchProj").onclick = function(event) {
        persp = !persp;
    };
    document.getElementById("switchUp").onclick = function(event) {
        upY = !upY;
    };
    document.getElementById("startUpCube").onclick = function(event) {
        upRotate = !upRotate;
    };
    document.getElementById("startBottomCube").onclick = function(event) {
        bottomRotate = !bottomRotate;
    };
    document.getElementById("topCubeSlider").onchange = function(event) {
        topSpeed = parseInt(event.target.value);
    };
    document.getElementById("bottomCubeSlider").onchange = function(event) {
        bottomSpeed = parseInt(event.target.value);
    };
    document.getElementById("zFarSlider").onchange = function(event) {
        far = parseFloat(event.target.value);
    };
    document.getElementById("yAtSlider").onchange = function(event) {
        yAt = parseFloat(event.target.value);
    };
    document.getElementById("zEyeSlider").onchange = function(event) {
        zEye = parseFloat(event.target.value);
    };
    document.getElementById("zNearSlider").onchange = function(event) {
        near = parseFloat(event.target.value);
    };
    document.getElementById("aspectSlider").onchange = function(event) {
        aspect = parseFloat(event.target.value);
    };
    document.getElementById("fovSlider").onchange = function(event) {
        fovy = parseFloat(event.target.value);
    };

    render();
}


var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(0.0,0.0,zEye);
	at = vec3(0.0, yAt, 0.0);
    if (upY) {up = vec3(0.0, 1.0, 0.0);}
	else {up = vec3(1.0, 0.0, 0.0);}

    if (persp) {projectionMatrix = perspective(fovy, aspect, near, far);}
	else {projectionMatrix = ortho(-2.0, 2.0,-2.0,2.0, near, far);}
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

	// Draw the first cube on top. Modifies the modelViewMatrix to incorporate scaling by 1/2 and translation to position on positive Y
    gl.viewport( 0, 0, canvas.width/2, canvas.height );

	modelViewMatrix = lookAt(eye, at , up);

    if (upRotate) {angleTop += topSpeed;console.log(angleTop)}
	rotate = rotateY(angleTop);
	scale = scalem(0.5,0.5,0.5); //scale by half
	trans = translate(0.0,0.5,0.0); // move .5 up along Y
	mat = mult(scale,rotate);
	mat = mult(trans,mat);
	modelViewMatrix = mult(modelViewMatrix,mat);
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

	modelViewMatrix = lookAt(eye, at , up);

	// Draw the second cube on bottom. Modifies the modelViewMatrix to incorporate scaling by 1/3 and translation to position on positive Y
    gl.viewport( canvas.width/2, 0, canvas.width, canvas.height );


    if (bottomRotate) {angleBottom += bottomSpeed;console.log(angleBottom)}
    rotate = rotateY(angleBottom);
	scale = scalem(0.33,0.33,0.33); //scale by one third
	trans = translate(0.0,-0.5,0.0); // move .5 down along Y
	mat = mult(scale,rotate);
	mat = mult(trans,mat);
	modelViewMatrix = mult(modelViewMatrix,mat);
	
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame(render);
}
