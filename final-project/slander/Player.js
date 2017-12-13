function Player(e){
    this.eye= e;
    this.pan_angle = 0.0;
    this.tilt_angle= 0.0;
    this.forwardKey= false;
    this.backwardKey=false;
    this.leftKey=false;
    this.rightKey=false;
    this.lockedState= false;
    this.get_at_in_world= function(){
        var pan_angle_rad= this.pan_angle * Math.PI / 180.0;
        var c_pan  = Math.cos(pan_angle_rad);
        var s_pan  = Math.sin(pan_angle_rad);
        var tilt_angle_rad = this.tilt_angle * Math.PI / 180.0;
        var c_tilt = Math.cos(tilt_angle_rad);
        var s_tilt = Math.sin(tilt_angle_rad);
        var A_pan_tilt = math.matrix( [
            [ c_pan , s_pan*s_tilt, s_pan*c_tilt, this.eye[0] ],
            [ 0.0   , c_tilt      , -s_tilt     , this.eye[1] ],
            [ -s_pan, c_pan*s_tilt, c_pan*c_tilt, this.eye[2] ],
            [ 0.0   , 0.0         , 0.0         , 1.0         ]
        ]);
        var z_direction = [
            [ 0.0 ],
            [ 0.0 ],
            [ 0.1 ],
            [ 1.0 ]
            ];
        var new_at = math.multiply( A_pan_tilt, z_direction);
        var new_at_vec= vec3(
            new_at.subset( math.index(0 , 0)),
            new_at.subset( math.index( 1, 0)),
            new_at.subset( math.index( 2, 0))
        );
        return new_at_vec;
    };
    this.pan= function(x_vel){
        var inc_const= 0.3;
        this.pan_angle -= inc_const*x_vel;
    };
    this.roll= function(y_vel){
        var inc_const= 0.3;
        if ( (y_vel > 0.0 && this.tilt_angle < 70.0) || ( y_vel <= 0.0 && this.tilt_angle > -70.0)){
           this.tilt_angle += inc_const*y_vel;
        }
    };
    this.step= function(){
        if (this.lockedState){
            var coeff= 0.06;
            var oriz_offset= 0.0;
            var sagitt_offset= 0.0;
            var vertical_offset= 0.0;
            if (this.forwardKey){
                sagitt_offset += coeff;
            }
            if (this.backwardKey){
                sagitt_offset -= coeff;
            }
            if (this.rightKey){
                oriz_offset -= coeff;
            }
            if (this.leftKey){
                oriz_offset += coeff;
            }
            if (this.upKey){
                vertical_offset += coeff/4.0;
            }
            if (this.downKey){
                vertical_offset -= coeff/3.0;
            }
            var pan_angle_rad= this.pan_angle * Math.PI / 180.0;
            var c_pan  = Math.cos(pan_angle_rad);
            var s_pan  = Math.sin(pan_angle_rad);
            var A_pan= math.matrix( [
                [ c_pan , 0.0 , s_pan , this.eye[0] ],
                [ 0.0   , 1.0 , 0.0   , this.eye[1] ],
                [ -s_pan, 0.0 , c_pan , this.eye[2] ],
                [ 0.0   , 0.0 , 0.0   , 1.0         ]
            ]);
            var displacement = [
                [ oriz_offset   ],
                [ vertical_offset],
                [ sagitt_offset ],
                [ 1.0           ]
            ];
            var new_eye = math.multiply( A_pan, displacement);
            var new_eye_vec = vec3(
                new_eye.subset( math.index(0 ,0)),
                new_eye.subset( math.index(1 ,0)),
                new_eye.subset( math.index(2 ,0))
            );
            this.eye= new_eye_vec;
        }
    };

    this.keyupHook = function(event) {
        if (this.lockedState) {
            var keyCode = event.keyCode;
            if (keyCode == 87) {
                this.forwardKey = false;
            }
            if (keyCode == 83) {
                this.backwardKey = false;
            }
            if (keyCode == 65) {
                this.leftKey = false;
            }
            if (keyCode == 68) {
                this.rightKey = false;
            }
            if (keyCode == 82){
                this.upKey = false;
            }
            if (keyCode == 70){
                this.downKey= false;
            }
        }
    };

    this.keydownHook = function(event) {
        if (this.lockedState) {
            var keyCode = event.keyCode;
            if (keyCode == 87) {
                this.forwardKey = true;
            }
            if (keyCode == 83) {
                this.backwardKey = true;
            }
            if (keyCode == 65) {
                this.leftKey = true;
            }
            if (keyCode == 68) {
                this.rightKey = true;
            }
            if (keyCode == 82){
                this.upKey = true;
            }
            if (keyCode == 70){
                this.downKey= true;
            }
        }
    };

};
