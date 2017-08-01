"use strict";

var canvas;
var gl;

var numVertices  = 42;
var program;


var pointsArray = [];
var colorsArray = [];

var normalsArray= [];


// var vertices = [
//                 vec4( -0.5, -0.5,  0.5, 1.0 ),
//                 vec4( -0.5,  0.5,  0.5, 1.0 ),
//                 vec4( 0.5,  0.5,  0.5, 1.0 ),
//                 vec4( 0.5, -0.5,  0.5, 1.0 ),
//                 vec4( -0.5, -0.5, -0.5, 1.0 ),
//                 vec4( -0.5,  0.5, -0.5, 1.0 ),
//                 vec4( 0.5,  0.5, -0.5, 1.0 ),
//                 vec4( 0.5, -0.5, -0.5, 1.0 )
//                 ];

var vertices = [
                vec4( -0.1, 0.1,  0.1, 1.0 ),
                vec4( -0.1,  0.3,  0.1, 1.0 ),
                vec4( 0.1,  0.3,  0.1, 1.0 ),
                vec4( 0.1, 0.1,  0.1, 1.0 ),
                vec4( -0.1, 0.1, -0.1, 1.0 ),
                vec4( -0.1, 0.3, -0.1, 1.0 ),
                vec4( 0.1,  0.3, -0.1, 1.0 ),
                vec4( 0.1, 0.1, -0.1, 1.0 )
                ];



var floor_vertices = [
                vec4( 1.0, 0.0,  1.0, 1.0 ),
                vec4( 1.0, 0.0,  -1.0, 1.0 ),
                vec4( -1.0,  0.0,  -1.0, 1.0 ),
                vec4( -1.0, 0.0,  1.0 , 1.0 ),
]


var vertexColors = [
                    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
                    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
                    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
                    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
                    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
                    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
                    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
                    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
                    ];
var gold= vec4( 1.0, 0.84, 0.0 , 1.0);

var projection , modelView;

var near = 0.1;
var far = 2.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;    

var eye = vec3(0.0, -0.3, 1.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


var spotlight_lightPosition = vec4(0.3, 0.4, -1.0, 1.0 );
var spotlight_lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var spotlight_lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotlight_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var spotlight_coneDirection = vec3(0.0, 0.0 , 1.0);
var spotlight_thetaCone = 5.0;
var spotlight_cutOff= 78.0;


var constant_attenuation= 0.5;
var linear_attenuation= 0.2;
var quadratic_attenuation= 0.3;


var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

function quad(a, b, c, d) {
    
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);
    normal = normalize(normal);
    
    
    
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    normalsArray.push(normal);
    
    
    
    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
    normalsArray.push(normal);
    
}




// a,b,c,d are the edges , color_index means the color of the quad
function drawFloor(){

    //normal computation
    var t1 = subtract(floor_vertices[1], floor_vertices[0]);
    var t2 = subtract(floor_vertices[2], floor_vertices[1]);
    var normal =  cross(t1, t2); 
    normal = normalize(vec3(normal)); 
    var color_index = 2;

    pointsArray.push(floor_vertices[0]);
    colorsArray.push(gold);
    normalsArray.push(normal);
    
    
    
    pointsArray.push(floor_vertices[1]);
    colorsArray.push(gold);
    normalsArray.push(normal);
    
    
    pointsArray.push(floor_vertices[2]);
    colorsArray.push(gold);
    normalsArray.push(normal);
    
    
    pointsArray.push(floor_vertices[0]);
    colorsArray.push(gold);
    normalsArray.push(normal);
    
    
    pointsArray.push(floor_vertices[2]);
    colorsArray.push(gold);
    normalsArray.push(normal);
    
    
    pointsArray.push(floor_vertices[3]);
    colorsArray.push(gold);
    normalsArray.push(normal);
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
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    drawFloor();
    colorCube();





    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var spotlight_ambientProduct = mult(spotlight_lightAmbient, materialAmbient);
    var spotlight_specularProduct = mult(spotlight_lightSpecular, materialSpecular);
    var spotlight_diffuseProduct = mult(spotlight_lightDiffuse, materialDiffuse);
    
    
    
    
    //spotlight 
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightAmbientProduct"),
                  flatten(spotlight_ambientProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightSpecularProduct"),
                  flatten(spotlight_specularProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightDiffuseProduct"),
                  flatten(spotlight_diffuseProduct));
    
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightLightPosition"),
                  flatten(spotlight_lightPosition));
    
    
    gl.uniform3fv(gl.getUniformLocation(program, "spotlight_coneDirection"),
                  flatten(spotlight_coneDirection));
    
    gl.uniform1f(gl.getUniformLocation(program, "spotlight_thetaCone"),
                 spotlight_thetaCone);
    
    gl.uniform1f(gl.getUniformLocation(program, "spotlight_cutOff"),
                 spotlight_cutOff);
    
    
    //attenuation coefficients
    
    gl.uniform1f(gl.getUniformLocation(program, "constant_attenuation"),
                 constant_attenuation);
    
    gl.uniform1f(gl.getUniformLocation(program, "linear_attenuation"),
                 linear_attenuation);
    
    gl.uniform1f(gl.getUniformLocation(program, "quadratic_attenuation"),
                 quadratic_attenuation);
    
    
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
                 materialShininess);
    
      document.getElementById("zFarSlider").onchange = function(event) {
        far = event.target.value;
    };
    document.getElementById("zNearSlider").onchange = function(event) {
        near = event.target.value;
    };
    document.getElementById("xcoordSlider").onchange = function(event) {
       eye[0] = parseFloat(event.target.value);
       console.log(eye);
    };
    document.getElementById("ycoordSlider").onchange = function(event) {
        eye[1] = parseFloat(event.target.value);
        console.log(eye);
    };
    document.getElementById("zcoordSlider").onchange = function(event) {
        eye[2] = parseFloat(event.target.value);
        console.log(eye);
    };
    document.getElementById("aspectSlider").onchange = function(event) {
        aspect = event.target.value;
    };
    document.getElementById("fovSlider").onchange = function(event) {
        fovy = event.target.value;
    };

    document.getElementById("x_at_coordSlider").onchange = function(event) {
       at[0] = parseFloat(event.target.value);
       console.log(at);
    };
    document.getElementById("y_at_coordSlider").onchange = function(event) {
        at[1] = parseFloat(event.target.value);
        console.log(at);
    };
    document.getElementById("z_at_coordSlider").onchange = function(event) {
        at[2] = parseFloat(event.target.value);
        console.log(at);
    };
    
    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
    modelView = lookAt(eye, at , up);
    projection = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "modelViewMatrix"), false, flatten(modelView) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "projectionMatrix"), false, flatten(projection) );
    
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}
