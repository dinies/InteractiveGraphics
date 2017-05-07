"use strict";

var canvas;
var gl;

var numVertices  = 36;

var texSize = 256;
var numChecks = 8;

var program;

var texture1, texture2, texture3;
var t1, t2;

var c;

//FLAGS

var flag_start_stop_rotation = false;
var flag_change_shading_tecnique= true;
var flag_positional_light= true;
var flag_directional_light= true;
var flag_spotlight_light= true;
var flag_toggle_random_texture= false;

//Textures
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

var image3 = new Uint8Array(4*texSize*texSize);
var a,b,c;
for ( var i = 0; i < texSize; i++ ) {
    for ( var j = 0; j <texSize; j++ ) {
        a=(Math.random() * 128);
        b=(Math.random() * 128);
        c=(Math.random() * 128);
        image3[4*i*texSize+4*j] = a;
        image3[4*i*texSize+4*j+1] = b;
        image3[4*i*texSize+4*j+2] = c;
        image3[4*i*texSize+4*j+3] =255;
        
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

var theta = [45.0, 45.0, 45.0];
var projection , modelView;

var positional_lightPosition = vec4(0.0, 1.0, 0.0, 1.0 );
var positional_lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
var positional_lightDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
var positional_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var directional_lightPosition = vec4(1.0, 0.0, 0.0, 0.0 );
var directional_lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
var directional_lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var directional_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var spotlight_lightPosition = vec4(0.0, 0.0, -1.0, 1.0 );
var spotlight_lightAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
var spotlight_lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotlight_lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var spotlight_coneDirection = vec3(0.0, 0.0 , 1.0);
var spotlight_thetaCone = 10.0;
var spotlight_cutOff= 78.0;


var constant_attenuation= 0.5;
var linear_attenuation= 0.2;
var quadratic_attenuation= 0.3;


var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;




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
    
    texture3 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture3 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
}

function quad(a, b, c, d) {
    
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normal = normalize(normal);
    
    
    
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
    
    gl.activeTexture( gl.TEXTURE2 );
    gl.bindTexture( gl.TEXTURE_2D, texture3 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex2"), 2);
    
    
    
    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    //products
    
    var positional_ambientProduct = mult(positional_lightAmbient, materialAmbient);
    var positional_specularProduct = mult(positional_lightSpecular, materialSpecular);
    var positional_diffuseProduct = mult(positional_lightDiffuse, materialDiffuse);
    
    var directional_ambientProduct = mult(directional_lightAmbient, materialAmbient);
    var directional_specularProduct = mult(directional_lightSpecular, materialSpecular);
    var directional_diffuseProduct = mult(directional_lightDiffuse, materialDiffuse);
    
    var spotlight_ambientProduct = mult(spotlight_lightAmbient, materialAmbient);
    var spotlight_specularProduct = mult(spotlight_lightSpecular, materialSpecular);
    var spotlight_diffuseProduct = mult(spotlight_lightDiffuse, materialDiffuse);
    
    
    
    
    //light bindings
    
    //positional
    gl.uniform4fv(gl.getUniformLocation(program, "positionalAmbientProduct"),
                  flatten(positional_ambientProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "positionalSpecularProduct"),
                  flatten(positional_specularProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "positionalDiffuseProduct"),
                  flatten(positional_diffuseProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "positionalLightPosition"),
                  flatten(positional_lightPosition));
    
    
    
    //directional
    gl.uniform4fv(gl.getUniformLocation(program, "directionalAmbientProduct"),
                  flatten(directional_ambientProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "directionalSpecularProduct"),
                  flatten(directional_specularProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "directionalDiffuseProduct"),
                  flatten(directional_diffuseProduct));
    
    
    gl.uniform4fv(gl.getUniformLocation(program, "directionalLightPosition"),
                  flatten(directional_lightPosition));
    
    
    
    //spotlight
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightAmbientProduct"),
                  flatten(spotlight_ambientProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightSpecularProduct"),
                  flatten(spotlight_specularProduct));
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightDiffuseProduct"),
                  flatten(spotlight_diffuseProduct));
    
    
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightLightPosition"),
                  flatten(spotlight_lightPosition));
    
    
    
    //spotlight params
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
    
    
    //projection matrix
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
                        false, flatten(projection));
    
    
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag_start_stop_rotation = !flag_start_stop_rotation;};
    document.getElementById("ButtonShading").onclick = function(){flag_change_shading_tecnique = !flag_change_shading_tecnique;};
    document.getElementById("RandomTexture").onclick = function(){flag_toggle_random_texture = !flag_toggle_random_texture;};
    
    document.getElementById("ButtonPositionalLight").onclick = function(){
        flag_positional_light = !flag_positional_light;
        if(flag_positional_light)
            document.getElementById("ButtonPositionalLight").style.background="Green";
        else{
            document.getElementById("ButtonPositionalLight").style.background="Red";
        }
    };
    
    document.getElementById("ButtonDirectionalLight").onclick = function(){
        flag_directional_light = !flag_directional_light;
        if(flag_directional_light)
            document.getElementById("ButtonDirectionalLight").style.background="Green";
        else{
            document.getElementById("ButtonDirectionalLight").style.background="Red";
        }
    };
    document.getElementById("ButtonSpotlightLight").onclick = function(){
        flag_spotlight_light = !flag_spotlight_light;
        if(flag_spotlight_light)
            document.getElementById("ButtonSpotlightLight").style.background="Green";
        else{
            document.getElementById("ButtonSpotlightLight").style.background="Red";
        }
    };
    
    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag_start_stop_rotation) theta[axis] += 2.0;
    
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "modelViewMatrix"), false, flatten(modelView) );
    
    
    gl.uniform1f(gl.getUniformLocation(program, "flagChangeShading"),
                 flag_change_shading_tecnique);
    
    gl.uniform1f(gl.getUniformLocation(program, "flagRandomTexture"),
                 flag_toggle_random_texture);
    
    gl.uniform1f(gl.getUniformLocation(program, "flagPositionalLight"),
                 flag_positional_light);
    
    gl.uniform1f(gl.getUniformLocation(program, "flagDirectionalLight"),
                 flag_directional_light);
    
    gl.uniform1f(gl.getUniformLocation(program, "flagSpotlightLight"),
                 flag_spotlight_light);
    
    
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}
