export class Vector {
    static connection (p1,p2) {
        return new Vector(p2.x-p1.x,p2.y-p1.y)
    }

    constructor(x, y, comp = true) {
        if (comp) {
            this.x = x;
            this.y = y;
            this.theta = null;
            this.abs = null;
        } else {
            this.x = undefined
            this.y = undefined
            this.abs = x;
            this.theta = y;
            this.calcComponents();
        }
    }

    setComp(x, y) {
        this.x = x;
        this.y = y;
        this.calcTheta();
    }


    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    calcMagnitude() {
        this.abs = Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    squaredMagnitude() {
        return (this.x ** 2 + this.y ** 2);
    }

    scaleUp(f) {
        this.x *= f;
        this.y *= f;
        return this;
    }

    scaleDown(f) {
        this.x /= f;
        this.y /= f;
        return this;
    }

    getTheta() {
        return Math.atan2(this.x, this.y)
    }

    calcComponents() {
        this.x = this.abs * Math.cos(this.theta)
        this.y = this.abs * Math.sin(this.theta)
    }

    calcTheta() {
        this.theta = Math.atan2(this.y, this.x)
    }

    normalize() {
        this.abs = this.magnitude();
        this.scaleDown(this.abs);
        return this;
    }

    rotate (r) {
        this.theta = (this.theta + r)% (Math.PI * 2);
        this.calcComponents();
    }

    update () {
        this.calcTheta();

        this.calcMagnitude();
        while (this.theta < 0){
            this.theta+=Math.PI*2
        }
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}


