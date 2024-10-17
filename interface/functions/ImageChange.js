import * as fabric from '../../fabric/dist/fabric.mjs';
import { ButtonFonctioner } from "../classes/ButtionFunctioner.js";


class ImageChange extends ButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
    }
    
    onClick(e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            let img = new Image();
            img.onload = function () {
                let width = img.width, height = img.height;
                // 移除先前图片
                if (this.interactPhoto.rect != undefined){
                    this.interactPhoto.canvas.remove(this.interactPhoto.rect);
                    this.interactPhoto.clearData();
                }
                // 创建图片Rect
                let pattern = new fabric.Pattern({
                    source: img,
                    repeat: 'repeat'
                });
                this.interactPhoto.rect = new fabric.Rect({
                    left: width / (-2),
                    top: height / (-2),
                    width: width,
                    height: height,
                    fill: pattern,
                    selectable: false,
                    hoverCursor: 'grab'
                });
                this.interactPhoto.canvas.add(this.interactPhoto.rect);
                // 更新页面
                document.getElementById('picInfo').innerHTML = `${img.width} × ${img.height}&nbsp;&nbsp;&nbsp;`;
                this.interactPhoto.reZoomCanvas(this.interactPhoto.rect);
            }.bind(this);
            img.src = e.target.result;
        }.bind(this);
        reader.readAsDataURL(file);
        this.interactPhoto.movable = true;
        this.interactPhoto.canvas.selection = true;
        this.interactPhoto.canvas.defaultCursor = 'grab';
        this.interactPhoto.canvas.remove(this.interactPhoto.text);
    }
}


export { ImageChange };