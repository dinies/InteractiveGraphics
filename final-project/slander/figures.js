

var pointsArray = [];
var normalsArray= [];

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
                    vec4( 0.0, 1.0, 1.0, 1.0 ),   // cyan
                    vec4( 1.0, 0.84, 0.0 , 1.0)   //gold
                    ];


function cubeColors( index ) {
	
	var colors_array= [];

	for (var i = 0; i < 36; i++) {
		colors_array.push(vertexColors[index]);
	}
	return colors_array;
}


function quadVertices(a, b, c, d) {
    
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = normalize(vec3(cross(t1, t2)));
    
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    
    
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
    
	for (var i = 0; i < 6; i++) {
    	normalsArray.push(normal);
	}

}


function generateCube() {

   	quadVertices( 1, 0, 3, 2);
   	quadVertices( 2, 3, 7, 6);
   	quadVertices( 3, 0, 4, 7);
   	quadVertices( 6, 5, 1, 2);
   	quadVertices( 4, 5, 6, 7);
   	quadVertices( 5, 4, 0, 1);

}
//SO3 coords ( x , y , z , roll , pitch, yaw)
function Parallelepiped( SO3_coords, colors_array) {
	this.coords= SO3_coords;
	this.colors = colors_array;
}

function floor() {
	var colors_array = cubeColors(5);
	return new Parallelepiped( [0,0,0,0,0,0] , colors_array);

}

function createScene(){
	//calculate normals   ----   fill buffer variables
	// load normal and vertex normals only once (compatible with each entity)
	generateCube();


	var f= floor();

	return {
		vertices_array : pointsArray,
		normals_array : normalsArray,
		floor : f // suitable data_struct
	};
}


function  computeNormalMatrix( viewMatrix, modelMatrix){
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
    return normalMatrix;
}


function drawScene( entities, gl,  view_matrix ){
	
	// 			for each e in entities
	// load a color buffer for each entity
	// use scale and translation data recovered from entities data struct
	// compute model matrix
	// then model view plus normal_matrix
	// load gl matrix variables
	// check if all buffers have been covered
	// gl.drawArrays( ... )
	var fig=  entities.floor;


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten( fig.colors ), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var model_matrix= mat4();

    var normal_matrix= computeNormalMatrix( view_matrix, model_matrix);


    gl.uniformMatrix4fv( gl.getUniformLocation(program,
                                               "modelMatrix"), false, flatten(modelMatrix) );

    gl.uniformMatrix3fv( gl.getUniformLocation(program,
                                               "normalMatrix"), false, flatten(normalMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, 36);

}



// function Tree(x,y){
//     this.x= x;
//     this.y= y;
//     this.pieces= 0;
//     this.struct= ...
//     this.draw= function(){
//     	...

//     }
//     this.build= function(size){
//     	...
//     }
// }
