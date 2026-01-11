import { Vector } from "./Vector.js";

export class Entity {
    static eta0 = 8.8541878188e-12
    static C = 1 / (Entity.eta0 * 4 * Math.PI)
    static C = 1000;
    static G = 0.03;

    static energyLossCollision = 0.90;

    constructor(x, y, vx, vy, r, c, m, col) {
        this.x = x;
        this.y = y;
        this.speed = new Vector(vx, vy)
        this.color = col;
        this.r = r;
        this.charge = c;
        this.mass = m;
        this.lastx = x;
        this.dx = 0;
        this.mark = false;
    }

    interact(e, forces) {
        const V = new Vector(this.x - e.x, this.y - e.y)
        const dSquared = (V.magnitude() * 0.1) ** 2;
        if (dSquared < 5000**2) {
            if (forces.C) {
                let Vc = V;
                let f = Entity.C / dSquared * this.charge * e.charge;
                Vc.normalize();
                Vc.scaleUp(f);

                this.speed.add(new Vector(Vc.x / this.mass, Vc.y / this.mass))
                e.speed.subtract(Vc.scaleDown(e.mass))
            }
            if (forces.G) {
                let Vc = new Vector(this.x - e.x, this.y - e.y)
                let dSquared = (Vc.magnitude() * 0.1) ** 2;
                let f = Entity.G / dSquared * this.mass * e.mass;
                Vc.scaleUp(f);

                this.speed.subtract(new Vector(Vc.x / this.mass, Vc.y / this.mass))
                e.speed.add(Vc.scaleDown(e.mass))
            }
        }
        //console.log(Vc.toString())
        //console.log(e.speed.toString())
    }



    interactCollide(e) {
        let Vc = new Vector(e.x - this.x, e.y - this.y)
        let dSquared = Vc.squaredMagnitude();
        if (dSquared < (this.r + e.r) ** 2) {

            let thetaAB = Vc.getTheta();
            let thetaA = this.speed.getTheta();
            let thetaB = e.speed.getTheta();
            let magVA = this.speed.magnitude();
            let magVB = e.speed.magnitude();

            let VAx = magVA * Math.cos(thetaA - thetaAB);  //the speed vector of a with his x component oriented folowing the conection vector
            let VAy = magVA * Math.sin(thetaA - thetaAB);

            let VBx = magVB * Math.cos(thetaB - thetaAB);  //the speed vector of b with his x component oriented folowing the conection vector
            let VBy = magVB * Math.sin(thetaB - thetaAB);

            let VAxNew = (this.mass * VAx + e.mass * (2 * VBx - VAx)) / (this.mass + e.mass) * Entity.energyLossCollision;
            let VBxNew = (e.mass * VBx + this.mass * (2 * VAx - VBx)) / (this.mass + e.mass) * Entity.energyLossCollision;

            VAxNew = 0;
            VBxNew = 0;

            let thetaANew = Math.atan2(VAxNew, VAy);
            let thetaBNew = Math.atan2(VBxNew, VBy);

            let magVANew = Math.sqrt(VAxNew ** 2 + VAy ** 2);
            let magVBNew = Math.sqrt(VBxNew ** 2 + VBy ** 2);

            this.speed = new Vector(magVANew * Math.cos(thetaANew - thetaAB), magVANew * Math.sin(thetaANew - thetaAB));
            e.speed = new Vector(magVBNew * Math.cos(thetaBNew - thetaAB), magVBNew * Math.sin(thetaBNew - thetaAB));

            this.mark = true;
        }
    }

    update() {
        this.dx = this.speed.x - this.lastx;
        if (Math.abs(this.dx) > 0) {
            //console.log(this.dx)
        }
        this.lastx = this.speed.x;
        this.x += this.speed.x;
        this.y += this.speed.y;
    }



}
