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

// var vertices = [
//                vec4( -0.1, 0.1,  0.1, 1.0 ),
//                vec4( -0.1,  0.3,  0.1, 1.0 ),
//                vec4( 0.1,  0.3,  0.1, 1.0 ),
//                vec4( 0.1, 0.1,  0.1, 1.0 ),
//                vec4( -0.1, 0.1, -0.1, 1.0 ),
//                vec4( -0.1, 0.3, -0.1, 1.0 ),
//                vec4( 0.1,  0.3, -0.1, 1.0 ),
//                vec4( 0.1, 0.1, -0.1, 1.0 )
//                ];


var vertices = [
                vec4( -0.1, 0.0,  0.1, 1.0 ),
                vec4( -0.1,  0.2,  0.1, 1.0 ),
                vec4( 0.1,  0.2,  0.1, 1.0 ),
                vec4( 0.1, 0.0,  0.1, 1.0 ),
                vec4( -0.1, 0.0, -0.1, 1.0 ),
                vec4( -0.1, 0.2, -0.1, 1.0 ),
                vec4( 0.1,  0.2, -0.1, 1.0 ),
                vec4( 0.1, 0.0, -0.1, 1.0 )
                ];



//var floor_vertices = [
//                vec4( 1.0, 0.0,  1.0, 1.0 ),
//                vec4( 1.0, 0.0,  -1.0, 1.0 ),
//                vec4( -1.0,  0.0,  -1.0, 1.0 ),
//                vec4( -1.0, 0.0,  1.0 , 1.0 ),
//]

var floor_vertices = [
                vec4( 1.0, -1.0,  0.0, 1.0 ),
                vec4( 1.0, 1.0,  0.0, 1.0 ),
                vec4( -1.0,  1.0,  0.0, 1.0 ),
                vec4( -1.0, -1.0,  0.0 , 1.0 ),
];

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


var projection , modelView;
var near = 0.1;
var far = 2.0;
var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect; 
var eye = vec3(0.0, 0.3, 1.0);
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var player;

var spotlight_lightPosition;
var spotlight_lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var spotlight_lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotlight_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var spotlight_coneDirection;
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
   	quad_colored( 1, 0, 3, 2 ,3);//green
   	quad_colored( 2, 3, 7, 6, 1 );//red
   	quad_colored( 3, 0, 4, 7, 2 );//yellow
   	quad_colored( 6, 5, 1, 2, 0 );//black
   	quad_colored( 4, 5, 6, 7, 4 );//blue
   	quad_colored( 5, 4, 0, 1, 5 );//magenta
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
    console.log('mov_X'+ movementX);
    console.log('mov_Y'+ movementY);
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

function Player(e, a){
    this.eye= e;
    this.at= a;
    this.forwardKey= false;
    this.backwardKey=false;
    this.leftKey=false;
    this.rightKey=false;
    this.lockedState= false;
    this.sagittal_axis= function(){
        var vec = subtract(this.at, this.eye); 
        vec[1] = 0 ;
        var s  = normalize(vec);
        return s;
    }
    this.compute_at_rotation= function( rot_matrix){
        var old_at= vec4( this.at[0], this.at[1], this.at[2], 1);
        var sag = this.sagittal_axis();
        var z= vec3( 0.0, 0.0, 1.0);
        var z_norm= Math.sqrt( z[0]*z[0] + z[1]*z[1] + z[2]*z[2] );
        var sag_norm= Math.sqrt( sag[0]*sag[0] + sag[1]*sag[1] + sag[2]*sag[2] );
        var phi_rad= Math.acos( dot( sag , z) * ( 1/(z_norm * sag_norm)));

        var c = Math.cos( phi_rad);
        var s = Math.sin( phi_rad);

        var matA01= mat4(
               c , 0.0, -s, 0.0,
               0.0, 1.0, 0.0, 0.0,
               s , 0.0, c, 0.0,
               this.eye[0], this.eye[1], this.eye[2], 1.0);
        var result= mult( matA01 , mult(  rot_matrix,  mult( inverse4( matA01 ),old_at)));
        this.at = vec3( result[0], result[1], result[2] );
    }
    this.roll= function(y_vel){
        console.log('roll_fun');
        var ipo = subtract(this.at, this.eye);
        var x_z_plane_proj= Math.sqrt( ipo[0]*ipo[0] + ipo[2]*ipo[2] );
        var current_roll_angle_rad= Math.atan2(ipo[1] , x_z_plane_proj );
        var curr_angle;
        var theta = 0;
        var coeff = 1;
        if (( this.at[1] - this.eye[1]) < 0.0){
            curr_angle = - ( current_roll_angle_rad * 180.0 / Math.PI);
        }
        else{
            curr_angle = current_roll_angle_rad * 180.0 / Math.PI;
        }

        if ( (y_vel > 0.0 && curr_angle < 70.0) || ( y_vel <= 0.0 && curr_angle > -70.0)){
           theta = coeff * y_vel; 
        }    
        
        this.compute_at_rotation( rotateX(theta));
        console.log('new eye'+this.eye[0]+' '+this.eye[1]+' '+this.eye[2]);
        console.log('new at'+this.at[0]+' '+this.at[1]+' '+this.at[2]);
    }
    this.pan= function(x_vel){
        console.log('pan_fun');
        var coeff= 1;
        var theta= coeff * x_vel;
        this.compute_at_rotation( rotateY(theta));
        console.log('new eye'+this.eye[0]+' '+this.eye[1]+' '+this.eye[2]);
        console.log('new at'+this.at[0]+' '+this.at[1]+' '+this.at[2]);
    
    }
    this.step= function(){
        console.log('step');
        if (this.lockedState){
            var y_axis= vec3( 0.0, 1.0, 0.0);
            var s= this.sagittal_axis();
            var coeff= 0.01;
            //TODO debug thi increments !!
            var c= vec3( coeff, coeff, coeff); 
            var shift_axis;
            var orizontal_axis= cross( s, y_axis);
            if (this.forwardKey){
                shift_axis= mult( s, c); 
                this.eye = add( this.eye, shift_axis);
                this.at= add( this.at, shift_axis);
            }
            if (this.backwardKey){
                shift_axis= mult(s ,c);
                this.eye = subtract( this.eye, shift_axis);
                this.at = subtract( this.at, shift_axis);
            }
            if (this.rightKey){
                shift_axis = mult( orizontal_axis, c);
                this.eye = add( this.eye, shift_axis);
                this.at = add( this.at, shift_axis);
            }
            if (this.leftKey){
                shift_axis = mult( orizontal_axis, c);
                this.eye = subtract(this.eye, shift_axis);
                this.at = subtract(this.at, shift_axis);
            }
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
    player = new Player(eye, at);


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
    

    document.addEventListener('pointerlockchange',changePointerLock, false);
    document.addEventListener('mozpointerlockchange',changePointerLock , false);
    
    document.onkeydown = function(e) { player.keydownHook(e); };
    document.onkeyup = function(e) { player.keyupHook(e); };

    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    player.step();

    modelView = lookAt(player.eye, player.at , up);
    projection = perspective(fovy, aspect, near, far);

    spotlight_lightPosition= vec4( player.eye[0],player.eye[1],player.eye[2], 1);
    spotlight_coneDirection=normalize( vec3( player.at[0]-player.eye[0], player.at[1]-player.eye[1], player.at[2]- player.eye[2]));
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightLightPosition"),
                  flatten(spotlight_lightPosition));
    
    
    gl.uniform3fv(gl.getUniformLocation(program, "spotlight_coneDirection"),
                  flatten(spotlight_coneDirection));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "modelViewMatrix"), false, flatten(modelView) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "projectionMatrix"), false, flatten(projection) );
    
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);

}
