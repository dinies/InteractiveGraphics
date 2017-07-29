"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];


var firebrick= vec4( 0.7, 0.13, 0.13 , 1.0);
var gold= vec4( 1.0, 0.84, 0.0 , 1.0);
var indigo= vec4( 0.29, 0.0 , 0.5, 1.0);
var dark_orange = vec4( 1.0, 0.3 , 0.0 , 1.0 );

var vertexColors= [
    indigo,
    firebrick,
    indigo,
    firebrick,
    gold,
    indigo,
    dark_orange,
    indigo
    ];
//FLAGS

var flag_start_stop_rotation = false;
var flag_start_stop_evolution = false;


// Parameters controlling the size of the Robot's hand

var PALM_HEIGHT= 4.5;
var PALM_WIDTH= 5.0;
var PALM_DEPTH= 1.4;

//INDEX-FINGER

var INDEX_FIRST_PHALANGES_HEIGHT      = 2.0;
var INDEX_FIRST_PHALANGES_WIDTH       = 1.2;
var INDEX_FIRST_PHALANGES_DEPTH       = 1.1;

var INDEX_SECOND_PHALANGES_HEIGHT = 1.9;
var INDEX_SECOND_PHALANGES_WIDTH  = 1.1;
var INDEX_SECOND_PHALANGES_DEPTH  = 1.0;

var INDEX_THIRD_PHALANGES_HEIGHT = 1.3;
var INDEX_THIRD_PHALANGES_WIDTH  = 0.9;
var INDEX_THIRD_PHALANGES_DEPTH  = 0.7;


//MIDDLE-FINGER

var MIDDLE_FIRST_PHALANGES_HEIGHT  = 2.2;
var MIDDLE_FIRST_PHALANGES_WIDTH   = 1.38;
var MIDDLE_FIRST_PHALANGES_DEPTH   = 1.3;

var MIDDLE_SECOND_PHALANGES_HEIGHT = 2.0;
var MIDDLE_SECOND_PHALANGES_WIDTH  = 1.27;
var MIDDLE_SECOND_PHALANGES_DEPTH  = 1.2;

var MIDDLE_THIRD_PHALANGES_HEIGHT = 1.3;
var MIDDLE_THIRD_PHALANGES_WIDTH  = 1.0;
var MIDDLE_THIRD_PHALANGES_DEPTH  = 0.9;


//RING-FINGER

var RING_FIRST_PHALANGES_HEIGHT  = 2.0;
var RING_FIRST_PHALANGES_WIDTH   = 1.2;
var RING_FIRST_PHALANGES_DEPTH   = 1.1;

var RING_SECOND_PHALANGES_HEIGHT = 2.0;
var RING_SECOND_PHALANGES_WIDTH  = 1.1;
var RING_SECOND_PHALANGES_DEPTH  = 1.0;

var RING_THIRD_PHALANGES_HEIGHT = 1.3;
var RING_THIRD_PHALANGES_WIDTH  = 0.9;
var RING_THIRD_PHALANGES_DEPTH  = 0.7;


//PINKY-FINGER

var PINKY_FIRST_PHALANGES_HEIGHT  = 1.6;
var PINKY_FIRST_PHALANGES_WIDTH   = 0.9;
var PINKY_FIRST_PHALANGES_DEPTH   = 0.7;

var PINKY_SECOND_PHALANGES_HEIGHT = 1.2;
var PINKY_SECOND_PHALANGES_WIDTH  = 0.8;
var PINKY_SECOND_PHALANGES_DEPTH  = 0.7;

var PINKY_THIRD_PHALANGES_HEIGHT = 1.0;
var PINKY_THIRD_PHALANGES_WIDTH  = 0.75;
var PINKY_THIRD_PHALANGES_DEPTH  = 0.7;


//THUMB

var THUMB_FIRST_PHALANGES_HEIGHT  = 1.7;
var THUMB_FIRST_PHALANGES_WIDTH   = 1.8;
var THUMB_FIRST_PHALANGES_DEPTH   = 1.4;

var THUMB_SECOND_PHALANGES_HEIGHT = 1.5;
var THUMB_SECOND_PHALANGES_WIDTH  = 1.6;
var THUMB_SECOND_PHALANGES_DEPTH  = 1.2;



// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis
var index_first_phalanges = 0;
var index_second_phalanges = 1;
var index_third_phalanges = 2;

var middle_first_phalanges = 3;
var middle_second_phalanges = 4;
var middle_third_phalanges = 5;

var ring_first_phalanges = 6;
var ring_second_phalanges = 7;
var ring_third_phalanges = 8;

var pinky_first_phalanges = 9;
var pinky_second_phalanges = 10;
var pinky_third_phalanges = 11;

var thumb_first_phalanges = 12;
var thumb_second_phalanges = 13;



var theta= new Array(14).fill(0.0);

//Orientation of the hand in the initial reference frame
var sigma = [ 0, 0, 0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}



//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    document.getElementById("ButtonE").onclick = function(){flag_start_stop_evolution = !flag_start_stop_evolution;};
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag_start_stop_rotation = !flag_start_stop_rotation;};

    render();
}

//----------------------------------------------------------------------------



function palm() {
    var s = scale4(PALM_WIDTH, PALM_HEIGHT, PALM_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * PALM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function indexFirstPhalanges() {
    var s = scale4(INDEX_FIRST_PHALANGES_WIDTH, INDEX_FIRST_PHALANGES_HEIGHT, INDEX_FIRST_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * INDEX_FIRST_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function indexSecondPhalanges() {
    var s = scale4(INDEX_SECOND_PHALANGES_WIDTH, INDEX_SECOND_PHALANGES_HEIGHT, INDEX_SECOND_PHALANGES_DEPTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * INDEX_SECOND_PHALANGES_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function indexThirdPhalanges()
{
    var s = scale4(INDEX_THIRD_PHALANGES_WIDTH, INDEX_THIRD_PHALANGES_HEIGHT, INDEX_THIRD_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * INDEX_THIRD_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function middleFirstPhalanges() {
    var s = scale4(MIDDLE_FIRST_PHALANGES_WIDTH, MIDDLE_FIRST_PHALANGES_HEIGHT, MIDDLE_FIRST_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * MIDDLE_FIRST_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function middleSecondPhalanges() {
    var s = scale4(MIDDLE_SECOND_PHALANGES_WIDTH, MIDDLE_SECOND_PHALANGES_HEIGHT, MIDDLE_SECOND_PHALANGES_DEPTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * MIDDLE_SECOND_PHALANGES_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function middleThirdPhalanges()
{
    var s = scale4(MIDDLE_THIRD_PHALANGES_WIDTH, MIDDLE_THIRD_PHALANGES_HEIGHT, MIDDLE_THIRD_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * MIDDLE_THIRD_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function ringFirstPhalanges() {
    var s = scale4(RING_FIRST_PHALANGES_WIDTH, RING_FIRST_PHALANGES_HEIGHT, RING_FIRST_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * RING_FIRST_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function ringSecondPhalanges() {
    var s = scale4(RING_SECOND_PHALANGES_WIDTH, RING_SECOND_PHALANGES_HEIGHT, RING_SECOND_PHALANGES_DEPTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * RING_SECOND_PHALANGES_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function ringThirdPhalanges()
{
    var s = scale4(RING_THIRD_PHALANGES_WIDTH, RING_THIRD_PHALANGES_HEIGHT, RING_THIRD_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * RING_THIRD_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function pinkyFirstPhalanges() {
    var s = scale4(PINKY_FIRST_PHALANGES_WIDTH, PINKY_FIRST_PHALANGES_HEIGHT, PINKY_FIRST_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * PINKY_FIRST_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function pinkySecondPhalanges() {
    var s = scale4(PINKY_SECOND_PHALANGES_WIDTH, PINKY_SECOND_PHALANGES_HEIGHT, PINKY_SECOND_PHALANGES_DEPTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * PINKY_SECOND_PHALANGES_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function pinkyThirdPhalanges()
{
    var s = scale4(PINKY_THIRD_PHALANGES_WIDTH, PINKY_THIRD_PHALANGES_HEIGHT, PINKY_THIRD_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * PINKY_THIRD_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}


function thumbFirstPhalanges() {
    var s = scale4(THUMB_FIRST_PHALANGES_WIDTH, THUMB_FIRST_PHALANGES_HEIGHT, THUMB_FIRST_PHALANGES_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * THUMB_FIRST_PHALANGES_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function thumbSecondPhalanges() {
    var s = scale4(THUMB_SECOND_PHALANGES_WIDTH, THUMB_SECOND_PHALANGES_HEIGHT, THUMB_SECOND_PHALANGES_DEPTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * THUMB_SECOND_PHALANGES_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    if(flag_start_stop_evolution) {
    
        for( j = 0; j < 14 ; j++) {
            if (theta[j] < 90.0) {
                switch(j) {
                    case 0:
                        theta[0] += 0.15;
                        break;
                    case 1:
                        theta[1] += 0.2;
                        break;
                    case 2:
                        theta[2] += 0.25;
                        break;
                    case 3:
                        theta[3] += 0.16;
                        break;
                    case 4:
                        theta[4] += 0.22;
                        break;
                    case 5:
                        theta[5] += 0.28;
                        break;
                    case 6:
                        theta[6] += 0.17;
                        break;
                    case 7:
                        theta[7] += 0.24;
                        break;
                    case 8:
                        theta[8] += 0.31;
                        break;
                    case 9:
                        theta[9] += 0.18;
                        break;
                    case 10:
                        theta[10] += 0.26;
                        break;
                    case 11:
                        theta[11] += 0.34;
                        break;
                    case 12:
                        theta[12] += 0.16;
                        break;
                    case 13:
                        theta[13] += 0.4;
                }
            } 
        }       
    }   else {

         for( var j=0 ; j < 14 ; j++ ) {
            if (theta[j] > 0.0) {
                switch(j) {
                    case 0:
                        theta[0] -= 0.15;
                        break;
                    case 1:
                        theta[1] -= 0.2;
                        break;
                    case 2:
                        theta[2] -= 0.25;
                        break;
                    case 3:
                        theta[3] -= 0.16;
                        break;
                    case 4:
                        theta[4] -= 0.22;
                        break;
                    case 5:
                        theta[5] -= 0.28;
                        break;
                    case 6:
                        theta[6] -= 0.17;
                        break;
                    case 7:
                        theta[7] -= 0.24;
                        break;
                    case 8:
                        theta[8] -= 0.31;
                        break;
                    case 9:
                        theta[9] -= 0.18;
                        break;
                    case 10:
                        theta[10] -= 0.26;
                        break;
                    case 11:
                        theta[11] -= 0.34;
                        break;
                    case 12:
                        theta[12] -= 0.16;
                        break;
                    case 13:
                        theta[13] -= 0.4;
                }
            } 
        }       

    }
    

    modelViewMatrix = mat4();

    if(flag_start_stop_rotation) sigma[axis] += 2.0;
    
    modelViewMatrix = mult(modelViewMatrix, rotate(sigma[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(sigma[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(sigma[zAxis], [0, 0, 1] ));



    var stack= [];

    palm();

    //INDEX-FINGER
    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(-PALM_WIDTH*0.38, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[index_first_phalanges], 1, 0, 0 ));
    indexFirstPhalanges();


    modelViewMatrix = mult(modelViewMatrix, translate(0.0, INDEX_FIRST_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[index_second_phalanges], 1, 0, 0 ));
    indexSecondPhalanges();

    
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, INDEX_SECOND_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[index_third_phalanges], 1, 0, 0) );
    indexThirdPhalanges();

    modelViewMatrix= stack.pop();

    //MIDDLE-FINGER


    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(-PALM_WIDTH*0.1, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[middle_first_phalanges], 1, 0, 0 ));
    middleFirstPhalanges();


    modelViewMatrix = mult(modelViewMatrix, translate(0.0, MIDDLE_FIRST_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[middle_second_phalanges], 1, 0, 0 ));
    middleSecondPhalanges();

    
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, MIDDLE_SECOND_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[middle_third_phalanges], 1, 0, 0) );
    middleThirdPhalanges();

    modelViewMatrix= stack.pop();


    //RING-FINGER


    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(PALM_WIDTH*0.18, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[ring_first_phalanges], 1, 0, 0 ));
    ringFirstPhalanges();


    modelViewMatrix = mult(modelViewMatrix, translate(0.0, RING_FIRST_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[ring_second_phalanges], 1, 0, 0 ));
    ringSecondPhalanges();

    
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, RING_SECOND_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[ring_third_phalanges], 1, 0, 0) );
    ringThirdPhalanges();

    modelViewMatrix= stack.pop();


    //PINKY-FINGER


    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(PALM_WIDTH*0.41, PALM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[pinky_first_phalanges], 1, 0, 0 ));
    pinkyFirstPhalanges();


    modelViewMatrix = mult(modelViewMatrix, translate(0.0, PINKY_FIRST_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[pinky_second_phalanges], 1, 0, 0 ));
    pinkySecondPhalanges();

    
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, PINKY_SECOND_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[pinky_third_phalanges], 1, 0, 0) );
    pinkyThirdPhalanges();

    modelViewMatrix= stack.pop();

    //THUMB


    stack.push(modelViewMatrix);

    modelViewMatrix = mult(modelViewMatrix, translate(-PALM_WIDTH*0.5, PALM_HEIGHT*0.28, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(90, 0, 0, 1 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[thumb_first_phalanges], 1, 0, 0 ));
    thumbFirstPhalanges();


    modelViewMatrix = mult(modelViewMatrix, translate(0.0, THUMB_FIRST_PHALANGES_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[thumb_second_phalanges], 1, 0, 0 ));
    thumbSecondPhalanges();

    




    requestAnimFrame(render);
}
