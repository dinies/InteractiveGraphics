function Surroundings(roofHeight , extension) {
    var colors_array ={
        terrain : cubeColors(10),
        sky : cubeColors(11),
        leafs: cubeColors(10) 
    };
    this.roof_height= roofHeight;
    this.surfaces= new Map();
    this.build= function(){
        this.surfaces.set("top", new Parallelepiped( [0.1,extension/2,extension/2], [ 0.0,this.roof_height,0.0], colors_array["leafs"], null ));
        this.surfaces.set("down", new Parallelepiped( [0.1,extension/2,extension/2], [ 0.0, 0.0, 0.0], colors_array["terrain"], null ));
        this.surfaces.set("forward", new Parallelepiped( [this.roof_height,extension/2,0.1], [ 0.0,this.roof_height/2,extension/4], colors_array["sky"], null ));
        this.surfaces.set("backward", new Parallelepiped( [this.roof_height,extension/2,0.1], [ 0.0,this.roof_height/2,-extension/4], colors_array["sky"], null ));
        this.surfaces.set("left", new Parallelepiped( [this.roof_height,0.1,extension/2], [extension/4,this.roof_height/2,0.0], colors_array["sky"], null ));
        this.surfaces.set("right", new Parallelepiped( [this.roof_height,0.1,extension/2], [-extension/4,this.roof_height/2,0.0], colors_array["sky"], null ));
    };
    this.draw= function(gl, view_matrix, player_position){
        var instance_mat= translate([player_position[0], 0.0 , player_position[2]]);
        this.surfaces.forEach( function(value, key){
            value.setHierarchyMat(instance_mat);
            value.draw(gl, view_matrix );
        });
    };
};
