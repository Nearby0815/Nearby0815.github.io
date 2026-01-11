import { Entity } from "./Entity.js";
import { Button } from "./Button.js";

export class Commons {
    static canvas = document.getElementById("canvas");
    

    static img = new Image();
    static icon = new Image();




    static init() {
        
        img.src = "https://staticg.sportskeeda.com/editor/2023/06/e1d0f-16878020478120-1920.jpg";
        icon.src = "https://img.favpng.com/1/2/1/minecraft-pocket-edition-sword-mod-pixel-art-png-favpng-DpBHckScTJ3aB5t2v3AuXqQFh.jpg";

        //map Data
        for (let x = 0; x < mapSizeUnscaled / 100; x++) {
            mapData[x] = [];
            for (let y = 0; y < mapSizeUnscaled / 100; y++) {
                mapData[x][y] = Math.random() * 0.8 + 0.2;
            }
        }


    }

    static checkButtons(e) {
        var highestTarget = getHighestTarget(e);
        if (highestTarget != null) {
            if (highestTarget instanceof Button) {
                highestTarget.clicked();
                return true;
            }
        }
        return false;
    }

    static selectEntity(e) {
        var highestTarget = getHighestTarget(e);
        if (highestTarget != null) {
            highestTarget.clicked();
            if (highestTarget instanceof Entity) {
                if (selectedEntity != null) selectedEntity.clicked();
                selectedEntity = null;
                selectedEntity = highestTarget;
            }
        } else {
            if (selectedEntity != null) selectedEntity.clicked();
            selectedEntity = null;
            clickMode = "selectEntity"
        }

    }

    static setTargetForEntity(e) {
        selectedEntity.targets = [];
        let target = getTarget(e)
        if (target.x === selectedEntity.x) {
            selectedEntity.clicked();
            selectedEntity = null;
        } else {
            selectedEntity.targets.push(target);
        }
        selectedEntity.clicked();
        selectedEntity = null;
        clickMode = "selectEntity"

    }

    static addTargetForEntity(e) {
        let target = getTarget(e)
        if (target.x === selectedEntity.x) {
            selectedEntity.clicked();
            selectedEntity = null;
            clickMode = "selectEntity"
        } else {
            selectedEntity.targets.push(target);
        }

    }

    static stopEntity(e) {
        selectedEntity.targets = [];
        selectedEntity.clicked();
        selectedEntity = null;
        clickMode = "selectEntity"
    }

    static getTarget(e) {
        var highestTarget = getHighestTarget(e);
        if (highestTarget instanceof Entity && highestTarget != selectedEntity) {
            return highestTarget;
        } else {
            let x = getWorldCoords(e.x, e.y).worldX;
            let y = getWorldCoords(e.x, e.y).worldY;
            return { x, y };
        }
    }

    static getTerrainSpeedModifier(x, y) {
        let mapX = Math.floor(x / mapSizeUnscaled * mapData.length);
        let mapY = Math.floor(y / mapSizeUnscaled * mapData[0].length);
        if (!(mapX < 0 || mapX >= mapData.length || mapY < 0 || mapY >= mapData[0].length)) {
            return mapData[mapX][mapY];
        } else {
            return 1;
        }
    }

    static getSquaredDistance(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    static getSceenCoords(worldX, worldY) {
        const screenX = offsetX + worldX * scale;
        const screenY = offsetY + worldY * scale;
        return { screenX, screenY };
    }

    static getWorldCoords(screenX, screenY) {
        const worldX = (screenX - offsetX) / scale;
        const worldY = (screenY - offsetY) / scale;
        return { worldX, worldY };
    }




    static clickEvent = {
        "selectEntity": selectEntity,
        "setTarget": setTargetForEntity,
        "addTarget": addTargetForEntity,
    }
    static clickMode = "selectEntity"
    static selectedEntity = null;



    

}