import { Rect } from "./rect.js";

export class Chunk {
    static classList = [];
    static vCoordsX = [-1, 0, 1, 1, 1, 0, -1, -1];
    static vCoordsY = [-1, -1, -1, 0, 1, 1, 1, 0];
    static chunkSize = 100;

    static settle(e) {
        var x = Math.floor(e.x);
        var y = Math.floor(e.y);
        var c = this.getChunk(x, y);
        c.entities.push(e);
    }

    static getChunk(x, y) {
        Chunk.classList.forEach(c => {
            if (c.x == x && c.y == y) {
                return c;
            }
        })
        return new Chunk(x, y);
    }

    searchVoisins() {
        this.voisins = []
        Chunk.classList.forEach(c => {
            Chunk.vCoordsX.forEach(x => {
                Chunk.vCoordsY.forEach(y => {
                    if (c.x == this.x + x && c.y == this.y + y) {
                        this.voisins.push(c);
                        if (this.voisins.length == 8) {
                            return
                        }
                    }
                })
            })
        });
    }

    updateVoisins() { //definitely not a risk of stackoverflow here :)
        this.voisins.forEach(v => {
            v.searchVoisins();
        })
    }

    update(){
        this.tick();
        if (this.visible){
            this.draw();
        }
    }

    tick(){
        this.entities.forEach(e=>{
            
        })
    }

    constructor(x, y) {
        Chunk.classList.push(this);
        this.x = x;
        this.y = y;
        this.voisins = this.searchVoisins();
        this.updateVoisins();
        this.entities = []
        this.boundingBox = new Rect(x * Chunk.chunkSize, y * Chunk.chunkSize, Chunk.chunkSize, Chunk.chunkSize);
        this.visible = false;
    }

    checkBoundingBox(e) {
        return this.boundingBox.contains(e.x, e.y);
    }


}