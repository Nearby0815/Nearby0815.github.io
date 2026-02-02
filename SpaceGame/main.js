import { Vector } from "./Vector.js";


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

const keysDown = new Set();

window.addEventListener("keydown", (e) => {
    keysDown.add(e.key);
});

window.addEventListener("keyup", (e) => {
    keysDown.delete(e.key);
});


let lastTime = performance.now();
let fps = 0;

let Entities = [];


let diffculty = 0.007;
const maxSpeed = 350;

let mainSwitch = true;

function draw(now) {
    let w = 5;
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(canvas.width, Math.random() * canvas.height, Math.random() * -w / 2, Math.random() * w - w / 2, 50 + Math.random() ** 2 * 100, 1))
    }
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(0, Math.random() * canvas.height, Math.random() * w / 2, Math.random() * w - w / 2, 50 + Math.random() ** 2 * 100, 1))
    }
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(Math.random() * canvas.width, canvas.height, Math.random() * w - w / 2, Math.random() * -w / 2, 50 + Math.random() ** 2 * 100, 1))
    }
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(Math.random() * canvas.width, 0, Math.random() * w - w / 2, Math.random() * w / 2, 50 + Math.random() ** 2 * 100, 1))
    }
    const delta = now - lastTime;
    fps = 1000 / delta;   // frames per second
    lastTime = now;

    //console.log(fps.toFixed(0));

    if (mainSwitch) { requestAnimationFrame(draw) }
    // Example: fill background so you see it working
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Entities.forEach(e => {
        Entities.forEach(o => {
            if (e != o) {
                e.interactCoulomb(o);
                e.interactCollide(o);
            }
        });
        e.update();
        e.draw(ctx);
    });

    player.update();
    player.draw(ctx);

    //console.log(Entities.length);
    /*ctx.fillStyle = '#0f0';
    ctx.font = '24px sans-serif';
    ctx.fillText('Fullscreen canvas (non-draggable, non-selectable)', Math.random() * 400, Math.random() * 400);*/

}

window.addEventListener('resize', resizeCanvas);


class Entity {
    static eta0 = 8.8541878188e-12
    static eta04pi = 1 / (Entity.eta0 * 4 * Math.PI)
    static eta04pi = 1000;

    static energyLossCollision = 0.90;

    constructor(x, y, vx, vy, r, m) {
        this.x = x;
        this.y = y;
        this.speed = new Vector(vx, vy)
        this.color = "rgb(255,0,0)";
        this.r = r;
        this.mass = Math.sqrt(r);
        this.lastx = x;
        this.dx = 0;
        this.mark = false;
    }

    interactCoulomb(e) {
        let Vc = new Vector(this.x - e.x, this.y - e.y)
        let dSquared = (Vc.magnitude() * 0.1) ** 2;
        let f = Entity.eta04pi / dSquared;
        f *= this.mass * e.mass / 100;
        Vc.normalize();
        Vc.scaleUp(f);

        this.speed.subtract(new Vector(Vc.x / this.mass, Vc.y / this.mass))
        e.speed.add(Vc.scaleDown(e.mass))
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

            //this.mark = true;

            var del = this.mass < e.mass ? this : e;

            Entities = Entities.filter(item => (item !== del));

            return true;
        }

        return false;
    }

    update() {
        this.dx = this.speed.x - this.lastx;
        if (Math.abs(this.dx) > 0) {
            //console.log(this.dx)
        }
        this.lastx = this.speed.x;
        this.x += this.speed.x;
        this.y += this.speed.y;

        let margin = 100;
        if (this.x < -margin || this.x > canvas.width + margin || this.y < -margin || this.y > canvas.height + margin) {
            Entities = Entities.filter(item => (item !== this));
        }
    }

    draw(ctx) {
        ctx.globalAlpha = 1.0;
        const screenCoords = (this.x, this.y);
        !this.mark ? ctx.fillStyle = this.color : ctx.fillStyle = "white";
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - this.r / 2, this.y - this.r / 2, this.r, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
        ctx.fill();
        ctx.stroke();
        //this.mark = false;
    }


}

class Player extends Entity {
    constructor() {
        super(canvas.width / 2, canvas.height / 2, 0, -1, 70, 0);
        this.mass = 0; //just in case this will negate all gravity
        this.color = "rgb(0,255,0)"
    }

    update() {
        this.control();
        this.keepInBounds();
        this.checkCollision();
        super.update();
    }

    control() {
        if (keysDown.has("w")||keysDown.has("W")) {
            if (this.speed.squaredMagnitude() < maxSpeed) { this.speed.scaleUp(1.75); }
        } else {
            if (this.speed.squaredMagnitude() > 1) { this.speed.scaleUp(0.99); }
        }

        if (keysDown.has("a") || keysDown.has("A")) {
            this.speed.rotate(-0.05);
        }
        if (keysDown.has("d") || keysDown.has("D")) {
            this.speed = this.speed.rotate(0.05);
        }
    }

    keepInBounds() {
        if (this.x < 0) { this.x = canvas.width }
        if (this.x > canvas.width) { this.x = 0 }
        if (this.y < 0) { this.y = canvas.height }
        if (this.y > canvas.height) { this.y = 0 }
    }

    checkCollision() {
        Entities.forEach(e => {
            if (this.interactCollide(e)) {
                mainSwitch = false;
            }
        })
    }


}





resizeCanvas();
const player = new Player();

draw();
/*
for (let i = 0; i < 4; i++) {
    Entities.push(new Entity(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * w, Math.random() * w, 50+ Math.random()**2 * 100, 1))
}*/
