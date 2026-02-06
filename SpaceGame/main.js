import { Vector } from "./Vector.js";


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    reset();
}


let worldX = 10;
let worldY = 10;
let ratioX = 1;
let ratioY = 1;
let scale = 1;

function reset() {

    //word long : 3500

    if (canvas.width > canvas.height) {
        worldX = 3500;
        worldY = 3500 * canvas.height / canvas.width;
    } else {
        worldY = 3500;
        worldX = 3500 / canvas.height * canvas.width;
    }

    worldX = canvas.width;
    worldY = canvas.height;

    ratioX = canvas.width / worldX;
    ratioY = canvas.height / worldY;

    scale = canvas.width/3500;
    maxSpeed = 350 * scale;
    player.r = 15 * scale;

    mainSwitch = true;

    try {
        player.x = worldX / 2;
        player.y = worldY / 2;
        player.speed = new Vector(0, -1);
    } finally { }

    console.log(canvas.width, canvas.height, worldX, worldY, ratioX, ratioY);

}

function getScreenX(wx) {
    return wx;
}

function getScreenY(wy) {
    return wy;
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
let Bullets = [];

let score = 1000;

let debug = false;


let diffculty = 0.005;
let maxSpeed = 350;

let mainSwitch = true;

function draw(now) {
    let w = 5;
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(canvas.width + 150, Math.random() * canvas.height, Math.random() * -w / 2, Math.random() * w - w / 2, (50 + Math.random() ** 2 * 100)*scale, -1))
    }
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(-150, Math.random() * canvas.height, Math.random() * w / 2, Math.random() * w - w / 2, ( 50 + Math.random() ** 2 * 100)*scale, -1))
    }
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(Math.random() * canvas.width, canvas.height + 150, Math.random() * w - w / 2, Math.random() * -w / 2, (50 + Math.random() ** 2 * 100)*scale, -1))
    }
    if (Math.random() > 1 - diffculty) {
        Entities.push(new Entity(Math.random() * canvas.width, -150, Math.random() * w - w / 2, Math.random() * w / 2, (50 + Math.random() ** 2 * 100)*scale, -1))
    }
    const delta = now - lastTime;
    fps = 1000 / delta;   // frames per second
    lastTime = now;

    //console.log(fps.toFixed(0));

    if (mainSwitch || debug) { requestAnimationFrame(draw) }
    // Example: fill background so you see it working
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw(ctx);

    Entities.forEach(e => {
        Entities.forEach(o => {
            if (e != o) {
                e.interactCoulomb(o);
                e.interactCollide(o);
            }
        });
        if (e !== null) {
            e.update(true);
            e.draw(ctx);
        }
    });

    Bullets.forEach(b => {
        Entities.forEach(o => {
            if (b.interactCollide(o)) {
                Bullets.filter(item => (item !== b));
            }
        });
        if (b !== null) {
            b.update();
            b.draw(ctx);
        }
    });




    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width / 2 - 20, 40, 350, 60)

    ctx.font = "60px helvetica";
    ctx.fillStyle = "white";
    ctx.fillText("score: " + score, canvas.width / 2 - 20, 100);

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

    constructor(x, y, vx, vy, r, p) {
        this.x = x;
        this.y = y;
        this.speed = new Vector(vx, vy)
        this.color = p > 900 ? "rgb(100,100,255)" : "rgb(255,0,0)";
        this.r = r;
        this.mass = Math.sqrt(r);
        this.lastx = x;
        this.dx = 0;
        this.mark = false;
        this.power = p == -1 ? this.mass : p;
    }

    interactCoulomb(e) {
        let Vc = new Vector(this.x - e.x, this.y - e.y)
        let dSquared = (Vc.magnitude() * 0.1) ** 2 / scale**2;
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
        let dSquared = Vc.squaredMagnitude() / (ratioX * ratioX);
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

            var del = this.power < e.power ? this : e;

            score += 15 * Math.round(del.mass);

            Entities = Entities.filter(item => (item !== del));

            return true;
        }

        return false;
    }

    update(kill) {
        this.dx = this.speed.x - this.lastx;
        if (Math.abs(this.dx) > 0) {
            //console.log(this.dx)
        }
        this.lastx = this.speed.x;
        this.x += this.speed.x;
        this.y += this.speed.y;

        let margin = 200;
        if ((this.x < -margin || this.x > canvas.width + margin || this.y < -margin || this.y > canvas.height + margin) && kill) {
            Entities = Entities.filter(item => (item !== this));
        }
    }

    draw(ctx) {
        ctx.globalAlpha = 1.0;
        const x = getScreenX(this.x);
        const y = getScreenY(this.y);
        const r = this.r;
        !this.mark ? ctx.fillStyle = this.color : ctx.fillStyle = "white";
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(x - r / 2, y - r / 2, r, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        //this.mark = false;
    }

    keepInBounds() {
        let marg = this.r;
        if (this.x < 0 - marg) { this.x = canvas.width + marg }
        if (this.x > canvas.width + marg) { this.x = 0 - marg }
        if (this.y < 0 - marg) { this.y = canvas.height + marg }
        if (this.y > canvas.height + marg) { this.y = 0 - marg }
    }


}

class Player extends Entity {
    constructor() {
        super(worldX / 2, worldY / 2, 0, -1, 15, -1);
        this.mass = 30; //just in case this will negate all gravity
        this.power = 0;
        this.color = "rgb(255, 136, 0)"
        this.b = 0;
        this.schweif = false;
        this.xl = this.x;
        this.yl = this.y;
        this.lvx = this.speed.x;
        this.lvy = this.speed.y;
    }

    update() {
        this.control();
        this.keepInBounds();
        this.checkCollision();
        this.attract();
        super.update(false);
        this.b = Math.max(this.b - 1, 0);

    }

    attract() {
        Entities.forEach(e => {
            this.interactCoulomb(e);
        })
    }

    control() {
        if ((keysDown.has("w") || keysDown.has("W")) && score > 0) {
            this.schweif = true;
            if (this.speed.squaredMagnitude() < maxSpeed) { this.speed.scaleUp(1.2); }
            score--;
            if (score === 0) { mainSwitch = false; }
        } else {
            this.schweif = false;
            if (this.speed.squaredMagnitude() > 1) { this.speed.scaleUp(0.99); }
        }

        if (keysDown.has("a") || keysDown.has("A")) {
            this.speed.rotate(-0.05);
        }
        if (keysDown.has("d") || keysDown.has("D")) {
            this.speed = this.speed.rotate(0.05);
        }
        if (keysDown.has(" ")) {
            this.spawnBullet();
        }

        if (keysDown.has("p" || "P")) {
            debug = ! debug;
        }

    }



    checkCollision() {
        Entities.forEach(e => {
            if (this.interactCollide(e)) {
                mainSwitch = false;
            }
        })
    }

    draw(ctx) {

        let tempX = this.x;
        let tempY = this.y;
        //this.x *= ratioX;
        //this.y *= ratioY;

        ctx.globalAlpha = 1.0;
        let orth = (new Vector(this.lvx, this.lvy)).getOrthogonal();
        let pointiness = this.r * 4;
        let point = new Vector(this.lvx, this.lvy);
        point.setLength(pointiness * 1.1);
        let width = this.r * 1.5;
        orth.setLength(width * 1.1);

        ctx.fillStyle = "black"
        ctx.strokeStyle = "black"

        ctx.beginPath();
        ctx.moveTo(this.lx + orth.x - this.r, this.ly + orth.y - this.r);
        ctx.lineTo(this.lx + point.x - this.r, this.ly + point.y - this.r);
        ctx.lineTo(this.lx - orth.x - this.r, this.ly - orth.y - this.r);
        ctx.lineTo(this.lx + orth.x - this.r, this.ly + orth.y - this.r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (this.schweif) {
            const x = this.lx - (this.x - this.lx) * 1;
            const y = this.ly - (this.y - this.ly) * 1;
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(x - this.r, y - this.r, this.r, 0, Math.PI * 2); // x, y, radius, startAngle, endAngle
            ctx.fill();
            ctx.closePath();
            ctx.stroke();
        }

        this.lx = this.x;
        this.ly = this.y;
        this.lvx = this.speed.x;
        this.lvy = this.speed.y;

        ctx.fillStyle = "white"
        ctx.strokeStyle = "white"

        orth = this.speed.getOrthogonal();
        orth.setLength(width);
        point = new Vector(this.speed.x, this.speed.y);
        point.setLength(pointiness);

        ctx.beginPath();
        ctx.moveTo(this.x + orth.x - this.r, this.y + orth.y - this.r);
        ctx.lineTo(this.x + point.x - this.r, this.y + point.y - this.r);
        ctx.lineTo(this.x - orth.x - this.r, this.y - orth.y - this.r);
        ctx.lineTo(this.x + orth.x - this.r, this.y + orth.y - this.r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();



        this.x = tempX;
        this.y = tempY;
    }

    spawnBullet() {
        if (this.b === 0) {
            if (score > 99) {
                let speed = this.speed.magnitude();
                let m = speed + 15 * scale;
                Bullets.push(new Bullet(this.x, this.y, this.speed.x / speed * m, this.speed.y / speed * m));
                this.b = 12;
                score -= 100;
            }
        }
    }


}

class Bullet extends Entity {

    constructor(x, y, vx, vy) {
        super(x, y, vx, vy, 2, 1000);
        this.lx = [x, x, x, x];
        this.ly = [y, y, y, y];
        this.life = 55;
    }

    update() {
        this.keepInBounds();
        super.update(false);

        this.lx.push(this.x);
        this.lx.shift();
        this.ly.push(this.y);
        this.ly.shift();
        this.life--;
        if (this.life === 0) { Bullets = Bullets.filter(item => (item !== this)); }

    }

    draw(ctx) {
        let x1 = getScreenX(this.lx[0])
        let y1 = getScreenY(this.ly[0]);
        let x2 = getScreenX(this.lx[2])
        let y2 = getScreenY(this.ly[2]);

        if (Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) < canvas.height-100) {
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
        }
    }
}




const player = new Player();
resizeCanvas();


draw();
/*
for (let i = 0; i < 4; i++) {
    Entities.push(new Entity(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * w, Math.random() * w, 50+ Math.random()**2 * 100, 1))
}*/

