import { Rect } from 'fabric';

class Rectangle {
    constructor(x, y, canvas) {
        this.canvas = canvas;
        this.rect = new Rect({
            left: x,
            top: y,
            strokeWidth: 2,
            stroke: 'blue',
            fill: 'rgba(0,0,0,0)',
            width: 0,
            height: 0,
            selectable: false,
            hoverCursor: 'grab',
        });

        this.canvas.add(this.rect);
    }

    update(x, y) {
        this.rect.set({ width: x - this.rect.left, height: y - this.rect.top });
        this.canvas.renderAll();
    }

    getCoordinates() {
        return {
            left: this.rect.left,
            top: this.rect.top,
            width: this.rect.width,
            height: this.rect.height,
        };
    }
}

export { Rectangle };
