
function Node(){
    this.values= new Map();
    this.left= null;
    this.right= null;
    this.parent= null;
    this.draw= function(gl,view_matrix){
        this.values.forEach( function(value,key){
            value.draw(gl,view_matrix);
        });
    };
    this.getChildren= function(){
        var children= [];
        if ( this.right != null){
            children.push(this.right);
        }
        if ( this.left != null){
            children.push(this.left);
        }
        return children;
    };
};
