function Tree(x,z,definition, width, height){
    this.x= x;
    this.z= z;
    this.width= width;
    this.height= height;
    this.root= new Node();
    this.definition= definition;

    this.build= function(){
        var rotational_offset= 90.0 /  this.definition;
        var rotation= rotate(rotational_offset, [0,1,0]);
        for (var i = 0; i < this.definition; i++) {
            var rot_mat=translate([this.x,0,this.z]);
            for (var j= 0; j<i ; j++){
                rot_mat= mult( rot_mat, rotation);
            };
            rot_mat= mult( rot_mat, translate([-this.x, 0.0, -this.z]));
            this.root.values.set("piece n"+i,  new Parallelepiped( [this.height, this.width, this.width], [this.x, this.height/2 , this.z ], cubeColors(9),rot_mat));
        };
    };
    this.draw= function(gl, view_matrix){
        var curr_node= this.root;
        var node_stack= this.root.getChildren();
        curr_node.draw(gl,view_matrix);
        while ( node_stack.length > 0){
            curr_node= node_stack.pop();
            curr_node.draw(gl,view_matrix);
            node_stack= curr_node.getChildren().concat(node_stack);
        }
    };
    this.isInside= function(pos, occupancyRay){
        var ray = this.width / 2 ;
        var minimumDistance = ray+occupancyRay;
        var currentDistance = Math.sqrt( Math.pow( this.x - pos[0],2) + Math.pow( this.z - pos[2],2));
        return currentDistance < minimumDistance;
    };
};
