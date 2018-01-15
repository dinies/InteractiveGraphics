function Slender( x , z, scale_factor) {
    this.position= {
        x: x,
        z: z
    };
    this.width= 0.3*scale_factor;
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
    this.col_black= cubeColors(0);
    this.col_white= cubeColors(6);

    this.setPosition= function(newX, newZ){
        this.position["x"]= newX;
        this.position["z"]= newZ;
    };

    this.computePan= function(player_eye){
        return Math.atan2(  player_eye[0] - this.position["x"], player_eye[2]-this.position["z"]);
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

    this.isInside= function(pos, occupancyRay){
        var ray = this.width / 2 ;
        var minimumDistance = ray+occupancyRay;
        var currentDistance = Math.sqrt( Math.pow( this.position["x"] - pos[0],2) + Math.pow( this.position["z"] - pos[2],2));
        return currentDistance < minimumDistance;
    };

    this.build = function(){
        var M;

        var x_offset;
        var y_offset;

        this.joints.set("r_ankle", new Joint());

        this.pieces.set("r_leg", new Parallelepiped( this.getDimPiece("leg"), this.getTranslPiece("leg") , this.col_black, null));

        x_offset= this.measures["body_width"]/2 - this.measures["leg_width"]/2;
        this.link_chain.set("r_leg_to_body", translate( x_offset , this.measures["leg_height"], 0.0));

        this.joints.set("r_hip", new Joint());

        this.pieces.set("body", new Parallelepiped( this.getDimPiece("body"), this.getTranslPiece("body"),this.col_black, null));

        this.link_chain.set("body_to_l_leg", mult( translate( x_offset, 0.0, 0.0), rotate(180.0, [0,0,1])) );

        this.joints.set("l_hip", new Joint());

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


        this.setRangesAnimation();
    };
    this.draw=function(gl, view_matrix, player_eye){
        //use player_eye to compute the right pan_angle
        var pan_angle_rad= this.computePan(player_eye);

        var pan_angle_deg= pan_angle_rad * 180.0 / Math.PI;
        var stack= [];
        var M= mat4();

        //right_ankle
        M= mult( M, translate( this.position["x"], 0.0, this.position["z"]) );
        M= mult( M, rotate( pan_angle_deg, [0, 1, 0]));
        M= mult( M, this.joints.get("r_ankle").getKinematicMat());

        this.pieces.get("r_leg").setHierarchyMat(M);

        M= mult( M, this.link_chain.get("r_leg_to_body"));
        M= mult( M, this.joints.get("r_hip").getKinematicMat());

        this.pieces.get("body").setHierarchyMat(M);

        stack.push(M);

        M= mult( M, this.link_chain.get("body_to_l_leg"));
        M= mult( M, this.joints.get("l_hip").getKinematicMat());

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

    this.setRangesAnimation = function(){
        this.joints.get("r_ankle").setRange( [ 0 ,  45 ]);
        this.joints.get("r_hip").setRange( [ 0 ,  30 ]);
        this.joints.get("neck").setRange( [ 0 ,  -15 ]);
        this.joints.get("l_hip").setRange( [ 0 ,  60 ]);
        this.joints.get("r_shoulder").setRange( [ 0 ,  20 ]);
        this.joints.get("l_shoulder").setRange( [ 0 ,  30 ]);
        this.joints.get("r_wrist").setRange( [ 0 ,  20 ]);
        this.joints.get("l_wrist").setRange( [ 0 ,  20 ]);
    };
    this.resetJoints= function(){
        this.joints.forEach(function(value, key) {
            value.setAngle(0);
        });
    };

    this.animate=function(time){
        var currPoint = time/100.0;
        this.joints.forEach(function(value, key) {
            value.animate(currPoint);
        });
    };
};

