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
        // build all the trees
    		var tree_list= [];
    		tree_list[0] = new Tree(4.0 , 4.0 , 2, 4, 2.0, 70.0);
    		tree_list[0].build();
        var slender= new Slender( -1.0, -1.0,   1.0);
        slender.build();
        var surroundings= new Surroundings(40,70);
        surroundings.build();
    		this.entities= {
    			  surroundings : surroundings,
    			  trees : tree_list,
    			  slender : slender
    		};
    };
    this.draw= function( gl,  view_matrix, player_eye){
    		// 			for each e in entities
    		// load a color buffer for each entity
    		// use scale and translation data recovered from entities data struct
    		// compute model matrix
    		// then model view plus normal_matrix
    		// load gl matrix variables
    		// check if all buffers have been covered
    		// gl.drawArrays( ... )

    		this.entities.surroundings.draw( gl, view_matrix, player_eye);
    		this.entities.trees[0].draw( gl, view_matrix);
        this.entities.slender.draw( gl, view_matrix, player_eye);
    };
};

