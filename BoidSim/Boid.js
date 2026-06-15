import { Vector } from "../helperClasses/Vector.js";

export class Boid {
    static classList = []
    static CoM = { x: undefined, y: undefined }
    static avDir = undefined
    static joinCoM = true;
    static avoidBoids = true;

    constructor(x, y, phi, v) {
        this.x = x
        this.y = y
        this.speed = new Vector(v, phi, false)
        this.speed.update();
        Boid.classList.push(this)
        this.color = "rgb(255,0,0)"
        this.r = 10; //for follow feature
        this.mark = false
    }

    update() {
        this.x += this.speed.x;
        this.y += this.speed.y;
    }

    ctrl() {
        this.speed.update();


        //join Center of Mass
        if (Boid.joinCoM) {
            let targ = Vector.connection({ x: this.x, y: this.y }, Boid.CoM)
            targ.calcTheta();
            while (targ.theta < 0) {
                targ.theta += 2 * Math.PI
            }
            let alpha = targ.theta - this.speed.theta;
            while (alpha < 0) {
                alpha += 2 * Math.PI;
            }
            this.speed.rotate((alpha) / 20)
        }

        //avoid other Boids
        if (Boid.avoidBoids) {
            this.speed.calcMagnitude();
            const avoidMarg = (120 * this.speed.abs) * (120 * this.speed.abs);
            let minT = Infinity;
            let biggestThreat = undefined;
            Boid.classList.forEach(other => {
                if (this != other) {
                    const sDist = Vector.getSquaredDistance({ x: this.x, y: this.y }, { x: other.x, y: other.y })
                    if (sDist < avoidMarg) {
                        let tThis = (1 - other.speed.y / other.speed.x) * (this.x - other.y) / (this.y + (other.speed.y * this.speed.x / other.speed.x));
                        let tOther = (this.x - other.x + tThis * this.speed.x) / other.speed.x;
                        if (tThis > -this.r && tOther > -this.r && Math.abs(tThis - tOther) < 15) {
                            this.mark = true;
                            if (tThis < minT) {
                                minT = tThis;
                                biggestThreat = other;
                            }
                        }
                    }
                }
            })
            if (biggestThreat) {
                const minCurve = 0.05;
                let deltaAlpha = (biggestThreat.speed.theta - this.speed.theta) / 20;
                if (Math.abs(deltaAlpha) < minCurve) {
                    deltaAlpha = minCurve * deltaAlpha > 0 ? 1 : -1;
                }
                this.speed.rotate(deltaAlpha)
            }

        }

        //align with average direction




        /* this.speed.normalize();
         this.speed.scaleUp(10*targ.magnitude()/targ.squaredMagnitude())
 
         */


    }
}