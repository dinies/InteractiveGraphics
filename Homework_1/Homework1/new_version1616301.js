"use strict";

var canvas;
var gl;

var numVertices  = 36;

var texSize = 256;
var numChecks = 8;

var program;

var texture1, texture2;
var t1, t2;

var c;

var flag = true;

var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*texSize*texSize);

    // Create a checkerboard pattern
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image2[4*i*texSize+4*j] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+1] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+2] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+3] = 255;
           }
    }

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var normalsArray= [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
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

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

//var theta = [45.0, 45.0, 45.0];
var theta = [0, 0, 0];
var projection , modelView;


//shade cube config
var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

//lights and materials
//var lightPosition= vec4(1.0, 1.0 , 0.0, 1.0 );

//lightsOn
//var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0 );var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0 );

//lightsOff
//var lightAmbient= vec4(0.0, 0.0,  0.0, 0.0); var lightSpecular=  vec4(0.0, 0.0,  0.0, 0.0);var lightDiffuse=  vec4(0.0, 0.0,  0.0, 0.0);


//proves
//lightSpecular = vec4(1.0, 1.0, 1.0, 1.0 )


//var materialAmbient = vec4( 0.2, 0.0, 0.0, 1.0 );
//var materialSpecular = vec4( 0.0, 0.0, 1.0, 0.6 );
//var materialDiffuse = vec4( 0.0, 1.0, 0.0, 1.0);
//var materialShininess = 100.0;



function configureTexture() {
    texture1 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function quad(a, b, c, d) {

     //normal computation
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     //normal = normalize(normal);



     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(normal);



     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);
     normalsArray.push(normal);


     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(normal);


     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(normal);


     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(normal);


     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
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
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


     var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );



    configureTexture();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);

    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);


    projection = ortho(-1, 1, -1, 1, -100, 100);

    //products

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    //bindings


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
              flatten(ambientProduct));

    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
              flatten(specularProduct));

    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
              flatten(diffuseProduct));

    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
              materialShininess);

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
              flatten(lightPosition));

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));


 document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
 document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
 document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
 document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag) theta[axis] += 2.0;

    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );


    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}