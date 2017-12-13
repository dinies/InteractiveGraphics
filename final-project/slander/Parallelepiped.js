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

    	  var scale = this.scale4(this.size["width"], this.size["height"], this.size["depth"]);
    	  var instanceMatrix = mult(
    	    	translate(
        	    	this.translation[0],
    	    		  this.translation[1],
    	    		  this.translation[2]
    	    	),
    	    	scale
    	  );

    	  model_matrix = mult( this.hierarchy_mat, instanceMatrix);

    	  var normal_matrix= this.computeNormalMatrix( view_matrix, model_matrix);

    	  gl.uniformMatrix4fv( gl.getUniformLocation(program,
    	                                             "modelMatrix"), false, flatten(model_matrix) );

    	  gl.uniformMatrix3fv( gl.getUniformLocation(program,
    	                                             "normalMatrix"), false, flatten(normal_matrix) );

    	  gl.drawArrays( gl.TRIANGLES, 0, 36);
    };
    this.computeNormalMatrix= function( viewMatrix, modelMatrix){
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
    };

    this.scale4= function(a, b, c) {
        var result = mat4();
        result[0][0] = a;
        result[1][1] = b;
        result[2][2] = c;
        return result;
    };


};
