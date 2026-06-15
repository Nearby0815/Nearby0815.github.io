import { Vector } from "../helperClasses/Vector.js";

export class Boid {
    static classList = []
    static CoM = { x: undefined, y: undefined }
    static avDir = undefined

    constructor(x, y, phi, v) {
        this.x = x
        this.y = y
        this.speed = new Vector(v, phi, false)
        this.speed.update();
        Boid.classList.push(this)
        this.color = "rgb(255,0,0)"
        this.r = 10; //for follow feature
    }

    update() {
        this.x += this.speed.x;
        this.y += this.speed.y;
    }

    ctrl() {
//        const TURN = 0.05
        this.speed.update();
        

        //join Center of Mass
        let targ = Vector.connection({ x: this.x, y: this.y }, Boid.CoM)
        targ.calcTheta();
        while (targ.theta < 0) {
            targ.theta += 2*Math.PI
        }

        this.speed.rotate((targ.theta-this.speed.theta)/60)

        /*if (targ.theta > this.speed.theta) {
            this.speed.rotate(TURN)
        } else {
            this.speed.rotate(-TURN)
        }*/

        

       /* this.speed.normalize();
        this.speed.scaleUp(10*targ.magnitude()/targ.squaredMagnitude())

        */
        

    }
}