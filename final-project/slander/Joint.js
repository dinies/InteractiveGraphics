function Joint(){
    this.angle= 0;
    this.range= [ 0 , 360];
    this.setAngle= function( value){
        this.angle= value;
    };
    this.getAngle= function(){
        return this.angle;
    };
    this.getKinematicMat= function(){
        return rotate( this.angle, [1, 0, 0]);
    };
    this.setRange= function( vec ){
        this.range= vec;
    };
    this.animate= function( currS){
        this.setAngle( currS* ( this.range[1] - this.range[0]));
    };
};

