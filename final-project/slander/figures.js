var origin_model_matrix= mat4();



function Scene(){
	this.pointsArray = [];
	this.normalsArray= [];
	this.entities= {};

	this.vertices = [
                vec4( -0.5, -0.5,  0.5, 1.0 ),
                vec4( -0.5,  0.5,  0.5, 1.0 ),
                vec4( 0.5,  0.5,  0.5, 1.0 ),
                vec4( 0.5, -0.5,  0.5, 1.0 ),
                vec4( -0.5, -0.5, -0.5, 1.0 ),
                vec4( -0.5,  0.5, -0.5, 1.0 ),
                vec4( 0.5,  0.5, -0.5, 1.0 ),
                vec4( 0.5, -0.5, -0.5, 1.0 )
                ];

	this.quadVertices= function(a, b, c, d) {
    
	   	var t1 = subtract( this.vertices[b], this.vertices[a]);
   		var t2 = subtract( this.vertices[c], this.vertices[b]);
   		var normal = normalize(vec3(cross(t1, t2)));
    
    	this.pointsArray.push( this.vertices[a]);
    	this.pointsArray.push( this.vertices[b]);
    	this.pointsArray.push( this.vertices[c]);
    
    
	   	this.pointsArray.push( this.vertices[a]);
	    this.pointsArray.push( this.vertices[c]);
	    this.pointsArray.push( this.vertices[d]);
	    
		for (var i = 0; i < 6; i++) {
	    	this.normalsArray.push(normal);
		}

	};
	this.generateCube= function() {

	   	this.quadVertices( 1, 0, 3, 2);
	   	this.quadVertices( 2, 3, 7, 6);
	   	this.quadVertices( 3, 0, 4, 7);
	   	this.quadVertices( 6, 5, 1, 2);
	   	this.quadVertices( 4, 5, 6, 7);
	   	this.quadVertices( 5, 4, 0, 1);

	};

	this.create= function(){
		//calculate normals   ----   fill buffer variables
		// load normal and vertex normals only once (compatible with each entity)
		this.generateCube();

		var tree_list= [];
		tree_list[0] = new Tree(4.0 , 4.0 , 2);
		tree_list[0].build();
		

		this.entities= {
			floor : new Floor(),
			trees : tree_list,
			slender : new Slender()
		};
	};
	this.draw= function( gl,  view_matrix ){
		
		// 			for each e in entities
		// load a color buffer for each entity
		// use scale and translation data recovered from entities data struct
		// compute model matrix
		// then model view plus normal_matrix
		// load gl matrix variables
		// check if all buffers have been covered
		// gl.drawArrays( ... )

		this.entities.floor.draw( gl, view_matrix);
		this.entities.trees[0].draw( gl, view_matrix);
	}
};


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
};




function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
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





function Parallelepiped( height, width, depth, transl, colors_array) {  //rewrite args
	this.size= {
		height : height,
		width : width,
		depth : depth
	};
	this.translation= transl;
	this.colors = colors_array;
	this.draw= function(gl, view_matrix){
			var cBuffer = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten( this.colors ), gl.STATIC_DRAW );
	    
	    var vColor = gl.getAttribLocation( program, "vColor" );
	    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vColor );

	    var scale = scale4(this.size["width"], this.size["height"], this.size["depth"]);
	    var instanceMatrix = mult(
	    	translate( 
	    		this.translation[0],
	    		this.translation[1],
	    		this.translation[2] 
	    		),
	    	scale
	    	);

	    model_matrix = mult(origin_model_matrix, instanceMatrix);

	    var normal_matrix= computeNormalMatrix( view_matrix, model_matrix);


	    gl.uniformMatrix4fv( gl.getUniformLocation(program,
	                                               "modelMatrix"), false, flatten(model_matrix) );

	    gl.uniformMatrix3fv( gl.getUniformLocation(program,
	                                               "normalMatrix"), false, flatten(normal_matrix) );

	    gl.drawArrays( gl.TRIANGLES, 0, 36);
	
	}
}

function Slender( x , z) {
	this.position= [ x, z];
	this.build = 
	var 

}




function Floor() {
	var colors_array = cubeColors(5);
	this.surface=  new Parallelepiped( 1.0,30.0,30.0, [ 0.0,-1.0,0.0], colors_array);
	
	this.draw= function(gl, view_matrix){
		this.surface.draw(gl, view_matrix);
    }
}



function Node(){
	this.value= null;
	this.left= null;
	this.right= null;
	this.parent= null;

}


function Tree(x,z, layers){
    this.x= x;
    this.z= z;
    this.layers= layers;
    this.root= new Node();

    this.build= function(){
    	this.root.value= new Parallelepiped( 5.0, 0.5, 0.5, [this.x, 2.0 , this.z ], cubeColors(2) );
    }
    this.draw= function(gl, view_matrix){
    	this.root.value.draw(gl, view_matrix);

    }
}