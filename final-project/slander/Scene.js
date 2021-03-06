function Scene(){
    this.pointsArray = [];
    this.normalsArray= [];
    this.entities= {};
    this.areaExtension= 0.0;
    this.animationTime= 0.0;
    this.animationPhases = {
        lightOff : false,
        started: false
    };

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

    this.genRandWidth = function( avgWidth ){
        var variance = avgWidth/6;
        var willBePositive = Math.random()>= 0.5  ? true : false;
        var offset= Math.random()*variance;
        if (willBePositive) {
            return avgWidth+offset;
        }else{
            return avgWidth-offset;
        }
    };

    this.genRandCoord = function( extension ){
        var maxMagnitude = extension/2;
        var willBePositive = Math.random()>= 0.5  ? true : false;
        var coord = Math.random()*maxMagnitude;
        if ( willBePositive){
            return coord;
        }else{
            return -coord;
        }
    };

    this.populateForest= function(avgWidth, height, extension,treeDefinition, treeNum) {
    		var treeList= [];
        var cilinderDefinition = treeDefinition;
        var finalTreeNumber = treeNum;
        var currTreeNumber= 0;
        var maxIterations = finalTreeNumber * 5;
        var currIteration= 0;

        var xPos;
        var yPos = 0.0;
        var zPos;
        var width;
        var isInsideTrees;
        while (( currTreeNumber < finalTreeNumber) && ( currIteration < maxIterations)){
            xPos = this.genRandCoord(extension);
            zPos = this.genRandCoord(extension);
            width = this.genRandWidth(avgWidth);
            isInsideTrees = false;
            treeList.forEach( function(value,key){
                if ( value.isInside([xPos,yPos,zPos], width)){
                    isInsideTrees = true;
                };
            });
            if (!isInsideTrees){
                treeList.push( new Tree( xPos, zPos, cilinderDefinition, width, height ));
            }
            currTreeNumber ++;
            currIteration ++;
        }
        return treeList;
    };
    this.computeFreePosition= function( extension, occupancyRay){
        var xPos;
        var yPos = 0.0;
        var zPos;
        var validPosition = false;
        while (!validPosition){
            xPos = this.genRandCoord(extension);
            zPos = this.genRandCoord(extension);
            validPosition= !this.isInsideObjects( [xPos,yPos,zPos], occupancyRay );
        }
        return [xPos, zPos];
    };

    this.spawnSlender= function(scaleFactor,extension ){
        var pos  = this.computeFreePosition( extension, scaleFactor*2.5);
        return new Slender(pos[0], pos[1], scaleFactor);
    };


    this.create= function(videoQualityCoeff){
    		this.generateCube();

        var treeDefinition= 2.0 + videoQualityCoeff/2;
        var treeNumber = 50 * videoQualityCoeff;
        var sightDist = 20;
        this.areaExtension= sightDist * videoQualityCoeff;
        var height = 11;
        var avgTreeWidth = 1.0;
        var scaleFactor = 2.3;
        this.entities['surroundings']=  new Surroundings(height,sightDist*5);
        this.entities['trees']=  this.populateForest(avgTreeWidth, height, this.areaExtension, treeDefinition,treeNumber);
        this.entities['slender']=  this.spawnSlender(scaleFactor,this.areaExtension); 
        this.entities.surroundings.build();
    		this.entities.trees.forEach( function(value,key){
            value.build();
        });
        this.entities.slender.build();
    };
    this.draw= function( gl,  view_matrix, player_eye, spaceKey){
    		// load a color buffer for each entity
    		// compute model matrix
    		// then model view plus normal_matrix
    		// load gl matrix variables
        var spaceKeyPressedFlag = spaceKey;

    		this.entities.surroundings.draw( gl, view_matrix, player_eye);
    		this.entities.trees.forEach( function(value,key){
            value.draw(gl, view_matrix, player_eye);
        });



        var states = {
            false : {
                false: "standard",
                true: "animation"
            },
            true : {
                false: "preAnimation",
                true: "postAnimation"
            }
        };

        switch(states[this.animationPhases.lightOff ][ this.animationPhases.started]) {
        case "preAnimation":
            if (!spaceKey){
                this.animationPhases.lightOff = false;
                this.animationPhases.started= true;
            };
            break;
        case "animation":
            this.entities.slender.animate(this.animationTime );
            this.animationTime += 1.0;
            if ( this.animationTime > 100.0){
                this.animationPhases.lightOff = true;
                spaceKeyPressedFlag = true;//turn off the light
                var scaleFactor = this.entities['slender'].scaleFactor;
                var newPos= this.computeFreePosition(this.areaExtension,scaleFactor*2.5);
                this.entities['slender'].setPosition(newPos[0], newPos[1]);
                this.entities['slender'].resetJoints();
                this.animationTime = 0.0;
            };
            break;
        case "postAnimation":
            if (!spaceKey){
                this.animationPhases.lightOff = false;
                this.animationPhases.started= false;
            };
            break;
        default:
            if (spaceKey){
                this.animationPhases.lightOff = true;
            };
        };

        this.entities.slender.draw( gl, view_matrix, player_eye);

        return spaceKeyPressedFlag;
    };
    this.isInsideObjects= function( pos, occupancyRay ){
        var isInside = false;
        this.entities.trees.forEach( function(value,key){
            if ( value.isInside(pos, occupancyRay)){
                isInside = true;
            };
        });
        if ((this.entities.slender)&&( this.entities.slender.isInside(pos, occupancyRay))){
            isInside = true;
        }
        return isInside;
    };
};

