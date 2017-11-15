"use strict";

var canvas;
var gl;

var numVertices  = 48;
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


// var vertices = [
//                 vec4( -0.1, 0.0,  0.1, 1.0 ),
//                 vec4( -0.1,  0.2,  0.1, 1.0 ),
//                 vec4( 0.1,  0.2,  0.1, 1.0 ),
//                 vec4( 0.1, 0.0,  0.1, 1.0 ),
//                 vec4( -0.1, 0.0, -0.1, 1.0 ),
//                 vec4( -0.1, 0.2, -0.1, 1.0 ),
//                 vec4( 0.1,  0.2, -0.1, 1.0 ),
//                 vec4( 0.1, 0.0, -0.1, 1.0 )
//                 ];



var floor_vertices = [
                vec4( 1.0, 0.0,  1.0, 1.0 ),
                vec4( 1.0, 0.0,  -1.0, 1.0 ),
                vec4( -1.0,  0.0,  -1.0, 1.0 ),
                vec4( -1.0, 0.0,  1.0 , 1.0 ),
];

//var floor_vertices = [
//                vec4( 1.0, -1.0,  0.0, 1.0 ),
//                vec4( 1.0, 1.0,  0.0, 1.0 ),
//                vec4( -1.0,  1.0,  0.0, 1.0 ),
//                vec4( -1.0, -1.0,  0.0 , 1.0 ),
//];

var patch_vertices = [
                vec4( 0.3, 0.2, 0.6, 1.0),
                vec4( 0.3, 0.4, 0.6, 1.0),
                vec4( 0.6, 0.4, 0.3, 1.0),
                vec4( 0.6, 0.2, 0.3, 1.0)
];

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
var yell= vec4( 1.0, 1.0, 0.0, 1.0 ); 
var blue= vec4( 0.0, 0.0, 1.0, 1.0 );
var redd= vec4( 1.0, 0.0, 0.0, 1.0 );
var cyan=  vec4( 0.0, 1.0, 1.0, 1.0 );


var projectionMatrix , viewMatrix, modelMatrix, normalMatrix;
var near = 0.02;
var far = 5.0;
var  fovy = 60.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect; 
var initial_eye = vec3(0.0, 0.2, -0.3);
const up = vec3(0.0, 1.0, 0.0);
var player;

var spotlight_lightPosition;
var spotlight_lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var spotlight_lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotlight_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var spotlight_coneDirection;
var spotlight_thetaCone = 15.0;
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


function quad_colored(a, b, c, d, color) {
    
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);
    normal = normalize(normal);
    
    
    
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[color]);
    normalsArray.push(normal);
    
    
    
    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[color]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[color]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[color]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[color]);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[color]);
    normalsArray.push(normal);
    
}



// r,b,c,d are the edges , color_index means the color of the quad
function drawFloor(){

    //normal computation
    var t1 = subtract(floor_vertices[1], floor_vertices[0]);
    var t2 = subtract(floor_vertices[2], floor_vertices[1]);
    var normal =  cross(t1, t2); 
    normal = normalize(vec3(normal)); 

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
function drawTriangle(vertices_triang){
    //normal computation
    var t1 = subtract(vertices_triang[1], vertices_triang[0]);
    var t2 = subtract(vertices_triang[2], vertices_triang[1]);
    var normal =  cross(t1, t2); 
    normal = normalize(vec3(normal)); 

    pointsArray.push(vertices_triang[0]);
    colorsArray.push(redd);
    normalsArray.push(normal);
    
    
    
    pointsArray.push(vertices_triang[1]);
    colorsArray.push(redd);
    normalsArray.push(normal);
    
    
    pointsArray.push(vertices_triang[2]);
    colorsArray.push(redd);
    normalsArray.push(normal);
}

function drawPatch(){

    //normal computation
    var t1 = subtract(patch_vertices[1], patch_vertices[0]);
    var t2 = subtract(patch_vertices[2], patch_vertices[1]);
    var normal =  cross(t1, t2); 
    normal = normalize(vec3(normal)); 

    pointsArray.push(patch_vertices[0]);
    colorsArray.push(redd);
    normalsArray.push(normal);
    
    
    
    pointsArray.push(patch_vertices[1]);
    colorsArray.push(cyan);
    normalsArray.push(normal);
    
    
    pointsArray.push(patch_vertices[2]);
    colorsArray.push(yell);
    normalsArray.push(normal);
    
    
    pointsArray.push(patch_vertices[0]);
    colorsArray.push(cyan);
    normalsArray.push(normal);
    
    
    pointsArray.push(patch_vertices[2]);
    colorsArray.push(blue);
    normalsArray.push(normal);
    
    
    pointsArray.push(patch_vertices[3]);
    colorsArray.push(gold);
    normalsArray.push(normal);
}

function colorCube()
{
   	quad( 1, 0, 3, 2 );//green
   	quad( 2, 3, 7, 6 );//red
   	quad( 3, 0, 4, 7 );//yellow
   	quad( 6, 5, 1, 2 );//black
   	quad( 4, 5, 6, 7 );//blue
   	quad( 5, 4, 0, 1 );//magenta
}

function moveCallback(e){
    var movementX=
            e.movementX ||
            e.mozMovementX||
            0,
        movementY=
            e.movementY ||
            e.mozMovementY ||
            0;
    // console.log('mov_X'+ movementX);
    // console.log('mov_Y'+ movementY);
    player.roll(movementY);
    player.pan(movementX);
}



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
       }
}

function Player(e){
    this.eye= e;
    this.pan_angle = 0.0;
    this.tilt_angle= 0.0;
    this.forwardKey= false;
    this.backwardKey=false;
    this.leftKey=false;
    this.rightKey=false;
    this.lockedState= false;
    this.get_at_in_world= function(){
        var pan_angle_rad= this.pan_angle * Math.PI / 180.0;
        var c_pan  = Math.cos(pan_angle_rad);
        var s_pan  = Math.sin(pan_angle_rad);
        var tilt_angle_rad = this.tilt_angle * Math.PI / 180.0;
        var c_tilt = Math.cos(tilt_angle_rad);
        var s_tilt = Math.sin(tilt_angle_rad);
        var A_pan_tilt = math.matrix( [
            [ c_pan , s_pan*s_tilt, s_pan*c_tilt, this.eye[0] ],
            [ 0.0, c_tilt, -s_tilt , this.eye[1] ],
            [ -s_pan, c_pan*s_tilt , c_pan*c_tilt , this.eye[2] ],
            [ 0.0 , 0.0 , 0.0 , 1.0 ]
        ])
        var z_direction = [
            [ 0.0 ],
            [ 0.0 ],
            [ 0.1 ],
            [ 1.0 ]
            ];
        var new_at = math.multiply( A_pan_tilt, z_direction);
        var new_at_vec= vec3(
            new_at.subset( math.index(0 , 0)),
            new_at.subset( math.index( 1, 0)),
            new_at.subset( math.index( 2, 0))
        );
        return new_at_vec;
    }
    this.pan= function(x_vel){
        var inc_const= 0.3;
        this.pan_angle -= inc_const*x_vel;
    }
    this.roll= function(y_vel){
        var inc_const= 0.3;
        if ( (y_vel > 0.0 && this.tilt_angle < 70.0) || ( y_vel <= 0.0 && this.tilt_angle > -70.0)){
           this.tilt_angle += inc_const*y_vel;
        }
    }
    this.step= function(){
        if (this.lockedState){
        var coeff= 0.01;
        var oriz_offset= 0.0;
        var sagitt_offset= 0.0;
           if (this.forwardKey){
              sagitt_offset += coeff;
            }
            if (this.backwardKey){
              sagitt_offset -= coeff;
            }
            if (this.rightKey){
              oriz_offset -= coeff;
            }
            if (this.leftKey){
              oriz_offset += coeff;
            }
        var pan_angle_rad= this.pan_angle * Math.PI / 180.0;
        var c_pan  = Math.cos(pan_angle_rad);
        var s_pan  = Math.sin(pan_angle_rad);
        var A_pan= math.matrix( [
            [ c_pan, 0.0 , s_pan , this.eye[0] ],
            [ 0.0, 1.0 , 0.0 , this.eye[1] ],
            [ -s_pan , 0.0 , c_pan , this.eye[2] ],
            [ 0.0 , 0.0 , 0.0 , 1.0 ]
        ]);
        var displacement = [
            [ oriz_offset ],
            [ 0.0 ],
            [ sagitt_offset ],
            [1.0]
        ];
        var new_eye = math.multiply( A_pan, displacement);
        var new_eye_vec = vec3(
            new_eye.subset( math.index(0 ,0)),
            new_eye.subset( math.index(1 ,0)),
            new_eye.subset( math.index(2 ,0))
        );
        this.eye= new_eye_vec;
       }
    }

   this.keyupHook = function(event) {
        if (this.lockedState) {
        var keyCode = event.keyCode;
        if (keyCode == 87) {
          this.forwardKey = false;
        }
        if (keyCode == 83) {
          this.backwardKey = false;
        }
        if (keyCode == 65) {
          this.leftKey = false;
       }
       if (keyCode == 68) {
         this.rightKey = false;
       }
     }
    }

   this.keydownHook = function(event) {
          if (this.lockedState) {
            var keyCode = event.keyCode;
            if (keyCode == 87) {
              this.forwardKey = true;
            }
            if (keyCode == 83) {
              this.backwardKey = true;
            }
            if (keyCode == 65) {
              this.leftKey = true;
            }
            if (keyCode == 68) {
              this.rightKey = true;
            }
          }
     }

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


   
    drawFloor();
    drawPatch();
    colorCube();

    // drawTriangle( [ vertices[6], vertices[5], vertices[0] ] );

    player = new Player(initial_eye);


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
    


    // document.getElementById("zFarSlider").onchange = function(event) {
    //     far = event.target.value;
    // };
    // document.getElementById("zNearSlider").onchange = function(event) {
    //     near = event.target.value;
    // };
    // document.getElementById("xcoordSlider").onchange = function(event) {
    //    eye[0] = parseFloat(event.target.value);
    //    console.log(eye);
    // };
    // document.getElementById("ycoordSlider").onchange = function(event) {
    //     eye[1] = parseFloat(event.target.value);
    //     console.log(eye);
    // };
    // document.getElementById("zcoordSlider").onchange = function(event) {
    //     eye[2] = parseFloat(event.target.value);
    //     console.log(eye);
    // };
    // document.getElementById("aspectSlider").onchange = function(event) {
    //     aspect = event.target.value;
    // };
    // document.getElementById("fovSlider").onchange = function(event) {
    //     fovy = event.target.value;
    // };

    // document.getElementById("x_at_coordSlider").onchange = function(event) {
    //    at[0] = parseFloat(event.target.value);
    //    console.log(at);
    // };
    // document.getElementById("y_at_coordSlider").onchange = function(event) {
    //     at[1] = parseFloat(event.target.value);
    //     console.log(at);
    // };
    // document.getElementById("z_at_coordSlider").onchange = function(event) {
    //     at[2] = parseFloat(event.target.value);
    //     console.log(at);
    // };
    

    document.addEventListener('pointerlockchange',changePointerLock, false);
    document.addEventListener('mozpointerlockchange',changePointerLock , false);
    
    document.onkeydown = function(e) { player.keydownHook(e); };
    document.onkeyup = function(e) { player.keyupHook(e); };

    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    player.step();
    var at = player.get_at_in_world();
    modelMatrix = mat4();
    viewMatrix = lookAt(player.eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    var modelView = mult(viewMatrix, modelMatrix);
    normalMatrix= mat3();
    normalMatrix[0][0]= modelView[0][0];
    normalMatrix[0][1]= modelView[0][1];
    normalMatrix[0][2]= modelView[0][2];
    normalMatrix[1][0]= modelView[1][0];
    normalMatrix[1][1]= modelView[1][1];
    normalMatrix[1][2]= modelView[1][2];
    normalMatrix[2][0]= modelView[2][0];
    normalMatrix[2][1]= modelView[2][1];
    normalMatrix[2][2]= modelView[2][2];

    normalMatrix= inverse(normalMatrix);
    normalMatrix= transpose(normalMatrix);


    //check on the distance eye- at checked !!
    // var dist = Math.sqrt(Math.pow(at[0]-player.eye[0],2) + Math.pow(at[1]-player.eye[1], 2) + Math.pow(at[2]- player.eye[2], 2));
    // console.log("distance :\n"+dist+"\n");

    spotlight_lightPosition= vec4( player.eye[0],player.eye[1],player.eye[2], 1);
    spotlight_coneDirection=normalize( vec3( at[0]-player.eye[0], at[1]-player.eye[1], at[2]- player.eye[2]));
    
    // spotlight_lightPosition= vec4( 0.5, 0.5, 0.5, 1.0);
    // spotlight_coneDirection= vec3(-0.3 , -0.3 , -0.3 );

    gl.uniform4fv(gl.getUniformLocation(program, "spotlightLightPosition"),
                  flatten(spotlight_lightPosition));
    
    
    gl.uniform3fv(gl.getUniformLocation(program, "spotlight_coneDirection"),
                  flatten(spotlight_coneDirection));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "modelMatrix"), false, flatten(modelMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "viewMatrix"), false, flatten(viewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "projectionMatrix"), false, flatten(projectionMatrix) );    
    gl.uniformMatrix3fv( gl.getUniformLocation(program,
                                               "normalMatrix"), false, flatten(normalMatrix) );
   
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);

}
