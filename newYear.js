const elCanvas = document.getElementById("canvas");
const ctx = elCanvas.getContext("2d");
elCanvas.width = window.innerWidth;
elCanvas.height = window.innerHeight - 70;
var width = elCanvas.width;
var height = elCanvas.height;
var randomSpawnCooldown = 0;
var hueText = Math.floor(Math.random() * 360);
let showInstructions = true;

var instructions = [
    "Click anywhere to launch fireworks!",
    "Cliquez sur l'écran pour lancer des feux d'artifice!",
    "Klicke, um Feuerwerk zu starten!",
]

var instructionsIndex = Math.floor(Math.random() * instructions.length);
var instructionCycleCooldown = 500;

var fireworks = [];
var particles = [];

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

ctx.fillStyle = "black";
ctx.fillRect(0, 0, width, height);

let density = 150;

elCanvas.addEventListener("click", (event) => {
    showInstructions = false;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top
    fireworks.push(new Firework(x, y));
    randomSpawnCooldown = 300;
});



class Firework {
    constructor(tx, ty) {
        this.target = { tx, ty };
        this.speed = Math.max((width - ty) / 30, 20);
        this.x = tx;
        this.y = height;
        this.coordinates = [];
        this.sizeMain = Math.random()**6 * 1.7 + 0.8;
        this.sizeAlt = Math.random()**6 * 1.9 + 1.0;
        for (let i = 0; i < 5; i++) {
            this.coordinates.push([this.x, this.y]);
        }
    }

    update(index) {
        this.y -= this.speed;
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        if (this.y <= this.target.ty) {
            let hue = Math.floor(Math.random() * 360)
            let lineWidth = Math.floor(Math.random()*3)+3;
            for (let i = 0; i < Math.floor(density*this.sizeMain); i++) {
                particles.push(new Particle(this.x, this.y, hue,this.sizeMain, lineWidth,0));
            }
            hue = Math.floor(Math.random() * 360)
            lineWidth = Math.floor(Math.random()*3)+3;
            let hueChange = (Math.random()*2-1)**3*4; //x^3 * 2 results in negative values for x<0; dont use exponents where a%2=0
            for (let i = 0; i < Math.floor(density/2*this.sizeAlt); i++) {
                particles.push(new Particle(this.x, this.y, hue,this.sizeAlt, lineWidth,hueChange));
            }
            fireworks.splice(index, 1);
        }

        if (this.y <= 0 || this.x <= 0 || this.x >= width || this.y >= height) {
            fireworks.splice(index, 1);
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}


class Particle {
    constructor(x, y, hue, size, width, hueChange) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        for (let i = 0; i < 5; i++) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() * 10 + 2 )*(size);
        //this.speed=1;
        this.friction = 0.95;
        this.lightness = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        //this.decay = 0;
        this.hue = hue;
        this.hueChange = hueChange;
        this.lineWidth = width;
    }

    update(index) {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + 1;
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.lightness -= this.decay;
        this.hue = (this.hue + this.hueChange) % 360;
        if (this.lightness <= 0) {
            particles.splice(index, 1);
        }
    }
    draw() {
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = 'hsl(' + Math.floor(this.hue) + ', 100%, ' + (this.lightness * 100) + '%)';
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

function loop() {
    ctx.font = "bold 80px 'Arial'";
    ctx.strokeStyle = 'hsl(' + Math.floor(hueText) + ', 100%, 50%)';
    hueText = (hueText + 0.5) % 360;
    ctx.textAlign = "center";
    ctx.strokeText("Happy New Year!", width / 2, height /5);

    if (showInstructions) {
        ctx.font = "20px 'Arial'";
        ctx.fillStyle = 'white';
        ctx.textAlign = "center";
        instructionCycleCooldown--;
        if (instructionCycleCooldown <= 0) {
            instructionCycleCooldown = 500;
            ctx.fillStyle = 'black';
            ctx.fillText(instructions[instructionsIndex], width / 2, height / 5 + 50); //drawing a rect would have me get the coords of the rect first. this easier
            ctx.fillStyle = 'white';
            instructionsIndex = (instructionsIndex + 1) % instructions.length;
        }
        ctx.fillText(instructions[instructionsIndex], width / 2, height / 5 + 50);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.065)";
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 3;
    fireworks.forEach((firework, index) => {
        firework.update(index);
        firework.draw();
    });

    particles.forEach((particle, index) => {
        particle.update(index);
        particle.draw();
    });

    randomSpawnCooldown--;

    if (randomSpawnCooldown < 0 && Math.random() < 0.01 ) {
        randomSpawnCooldown = 0;
        for (let i = 0; i < getBustSize(); i++) {
            fireworks.push(new Firework(Math.random() * width, Math.random() * height / 1.5));
        }
    }

    if (randomSpawnCooldown < -250 ) {
        randomSpawnCooldown = 150;
        for (let i = 0; i < Math.floor (width/100)+1; i++) {
            fireworks.push(new Firework( 100*i, Math.random() * height / 1.5));
        }
    }

    requestAnimFrame(loop);
}

function getBustSize() {
    return Math.floor(Math.random()**3*4)+1;
}

loop();
