
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
    		tree_list[0] = new Tree(4.0 , 4.0 , 2);
    		tree_list[0].build();
            var slender= new Slender( -1.0, -1.0,   0.4);
            slender.build();
    		this.entities= {
    			floor : new Floor(),
    			trees : tree_list,
    			slender : slender
    		};
    	};
    	  this.draw= function( gl,  view_matrix, player_eye ){
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
            this.entities.slender.draw( gl, view_matrix, player_eye);
    	};
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


    function Parallelepiped( size , transl, colors_array, hierarchy_mat) {  //rewrite args
    	  this.size= {
            height: size[0],
            width: size[1],
            depth: size[2]
        };
    	  this.translation= transl;
        this.hierarchy_mat= hierarchy_mat;
    	  this.colors = colors_array;
        this.setHierarchyMat= function(m){
            this.hierarchy_mat= m;
        };

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

    	    model_matrix = mult( this.hierarchy_mat, instanceMatrix);

    	    var normal_matrix= computeNormalMatrix( view_matrix, model_matrix);

    	    gl.uniformMatrix4fv( gl.getUniformLocation(program,
    	                                               "modelMatrix"), false, flatten(model_matrix) );

    	    gl.uniformMatrix3fv( gl.getUniformLocation(program,
    	                                               "normalMatrix"), false, flatten(normal_matrix) );

    	    gl.drawArrays( gl.TRIANGLES, 0, 36);
    	  };
    };

    //stub object for now
    function Joint(){
        this.getKinematicMat= function(){
            return mat4();
        };
    };

    function Slender( x , z, scale_factor) {
    	  this.position= {
            x: x,
            z: z
        };
        this.hierarchy_transf={};
        this.measures= {
            leg_height: 1.0*scale_factor,
            leg_width: 0.2*scale_factor,
            leg_depth: 0.15*scale_factor,
            body_height: 0.7*scale_factor,
            body_width: 0.5*scale_factor,
            body_depth: 0.2*scale_factor,
            head_height: 0.25*scale_factor,
            head_width: 0.2*scale_factor,
            head_depth: 0.15*scale_factor,
            arm_height: 0.9*scale_factor,
            arm_width: 0.15*scale_factor,
            arm_depth: 0.1*scale_factor,
            hand_height: 0.1*scale_factor,
            hand_width: 0.1*scale_factor,
            hand_depth: 0.1*scale_factor
        };

        this.joints= new Map();

        this.pieces= new Map();

        this.link_chain= new Map();
        this.col_black= cubeColors(8);
        this.col_white= cubeColors(6);


        this.computePan= function(player_eye){
            return 0.0;//TODO
        };

        this.getDimPiece= function(name ){
            var height= this.measures[name+"_height"];
            var width= this.measures[name+"_width"];
            var depth= this.measures[name+"_depth"];
            return [ height, width , depth];
        };

        this.getTranslPiece= function(name){
            return [ 0.0, this.measures[name+"_height"]/2,0.0];
        };

        this.build = function(){
            var M;

            var x_offset;
            var y_offset;

            this.joints.set("r_ankle", new Joint());

            this.pieces.set("r_leg", new Parallelepiped( this.getDimPiece("leg"), this.getTranslPiece("leg") , this.col_black, null));

            x_offset= this.measures["body_width"]/2 - this.measures["leg_width"]/2;
            this.link_chain.set("r_leg_to_body", translate( x_offset , this.measures["leg_height"], 0.0));

            //translate anca in english
            this.joints.set("r_anca", new Joint());

            this.pieces.set("body", new Parallelepiped( this.getDimPiece("body"), this.getTranslPiece("body"),this.col_black, null));

            this.link_chain.set("body_to_l_leg", mult( translate( x_offset, 0.0, 0.0), rotate(180.0, [0,0,1])) );

            this.joints.set("l_anca", new Joint());

            this.pieces.set("l_leg", new Parallelepiped(this.getDimPiece("leg"), this.getTranslPiece("leg") , this.col_black, null));

            this.link_chain.set("body_to_head", translate(0.0, this.measures["body_height"], 0.0));

            this.joints.set("neck", new Joint());

            this.pieces.set("head", new Parallelepiped( this.getDimPiece("head"), this.getTranslPiece("head"), this.col_white, null));

            y_offset= this.measures["body_height"]- this.measures["arm_width"]/2;
            this.link_chain.set("body_to_r_arm", mult(translate(- this.measures["body_width"]/2, y_offset, 0.0), rotate(180.0, [0,0,1])));

            this.joints.set("r_shoulder", new Joint());

            this.pieces.set("r_arm", new Parallelepiped( this.getDimPiece("arm"), this.getTranslPiece("arm"), this.col_black, null));

            this.link_chain.set("body_to_l_arm", mult(translate(this.measures["body_width"]/2, y_offset, 0.0), rotate(180.0, [0,0,1]) ));

            this.joints.set("l_shoulder", new Joint());

            this.pieces.set("l_arm", new Parallelepiped( this.getDimPiece("arm"), this.getTranslPiece("arm"), this.col_black, null));

            this.link_chain.set("r_arm_to_r_hand", translate( 0.0, this.measures["arm_height"],0.0));

            this.joints.set("r_wrist", new Joint());

            this.pieces.set("r_hand", new Parallelepiped( this.getDimPiece("hand"), this.getTranslPiece("hand"), this.col_white, null));

            this.link_chain.set("l_arm_to_l_hand", translate( 0.0, this.measures["arm_height"],0.0));

            this.joints.set("l_wrist", new Joint());

            this.pieces.set("l_hand", new Parallelepiped( this.getDimPiece("hand"), this.getTranslPiece("hand"), this.col_white, null));


                };
        this.draw=function(gl, view_matrix, player_eye){
            //use player_eye to compute the right pan_angle
            var pan_angle= this.computePan(player_eye);

            var stack= [];
            var M= mat4();

            //right_ankle
            M= mult( M, translate( this.position["x"], 0.0, this.position["z"]) );
            M= mult( M, rotate( pan_angle, [0, 1, 0]));
            M= mult( M, this.joints.get("r_ankle").getKinematicMat());

            this.pieces.get("r_leg").setHierarchyMat(M);

            M= mult( M, this.link_chain.get("r_leg_to_body"));
            M= mult( M, this.joints.get("r_anca").getKinematicMat());

            this.pieces.get("body").setHierarchyMat(M);

            stack.push(M);

            M= mult( M, this.link_chain.get("body_to_l_leg"));
            M= mult( M, this.joints.get("l_anca").getKinematicMat());

            this.pieces.get("l_leg").setHierarchyMat(M);

            M= stack[0];
            M= mult( M, this.link_chain.get("body_to_head"));
            M= mult( M, this.joints.get("neck").getKinematicMat());

            this.pieces.get("head").setHierarchyMat(M);

            M= stack[0];
            M= mult( M, this.link_chain.get("body_to_r_arm"));
            M= mult( M, this.joints.get("r_shoulder").getKinematicMat());
            this.pieces.get("r_arm").setHierarchyMat(M);

            M= mult( M, this.link_chain.get("r_arm_to_r_hand"));
            M= mult( M, this.joints.get("r_wrist").getKinematicMat());

            this.pieces.get("r_hand").setHierarchyMat(M);


            M= stack[0];
            M= mult( M, this.link_chain.get("body_to_l_arm"));
            M= mult( M, this.joints.get("l_shoulder").getKinematicMat());

            this.pieces.get("l_arm").setHierarchyMat(M);

            M= mult( M, this.link_chain.get("l_arm_to_l_hand"));
            M= mult( M, this.joints.get("l_wrist").getKinematicMat());

            this.pieces.get("l_hand").setHierarchyMat(M);



            this.pieces.forEach(function(value, key) {
                value.draw(gl,view_matrix);
                }
            );

        };
    };

    function Floor() {
    	  var colors_array = cubeColors(5);
    	  this.surface=  new Parallelepiped( [1.0,30.0,30.0], [ 0.0,-1.0,0.0], colors_array, mat4());
    	  this.draw= function(gl, view_matrix){
    		    this.surface.draw(gl, view_matrix);
        };
    };

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
        	  this.root.value= new Parallelepiped( [5.0, 0.5, 0.5], [this.x, 2.0 , this.z ], cubeColors(2), mat4() );
        };
        this.draw= function(gl, view_matrix){
        	this.root.value.draw(gl, view_matrix);
        };
    };
