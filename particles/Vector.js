export class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.theta = null;
        this.abs = null;
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

    getTheta(){
        return Math.atan2(this.x,this.y)
    }

    normalize() {
        this.abs = this.magnitude();
        this.scaleDown(this.abs);
        return this;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}


