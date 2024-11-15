import { Pattern, Rect } from 'fabric';
import { DefaultbuttonFunctioner } from './Default.js';

// 图片更换功能类
class ImageChange extends DefaultbuttonFunctioner {
    constructor(interactPhoto, clearAllData) {
        super(interactPhoto);
        this.clearAllData = clearAllData;
    }

    onClick(e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            let img = new Image();
            this.interactPhoto.img = img;
            img.onload = function () {
                let width = img.width,
                    height = img.height;
                // 移除先前图片
                if (this.interactPhoto.rect != undefined) {
                    this.clearAllData();
                    this.interactPhoto.canvas.remove(this.interactPhoto.rect);
                }
                // 创建图片Rect
                let pattern = new Pattern({
                    source: img,
                    repeat: 'repeat',
                });
                this.interactPhoto.rect = new Rect({
                    left: width / -2,
                    top: height / -2,
                    width: width,
                    height: height,
                    fill: pattern,
                    selectable: false,
                    hoverCursor: 'grab',
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
