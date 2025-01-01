import { FabricImage } from 'fabric';
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
            FabricImage.fromURL(e.target.result).then((img) => {
                let width = img.width,
                    height = img.height;
                // 移除先前图片
                if (this.interactPhoto.rect != undefined) {
                    this.clearAllData();
                    this.interactPhoto.canvas.remove(this.interactPhoto.rect);
                }
                // 创建图片Rect
                img.set({
                    left: width / -2,
                    top: height / -2,
                    selectable: false,
                    hoverCursor: 'grab',
                });
                this.interactPhoto.canvas.add(img);
                this.interactPhoto.rect = img;
                // 更新页面
                document.getElementById('picInfo').innerHTML = `${img.width} × ${img.height}&nbsp;&nbsp;&nbsp;`;
                this.interactPhoto.reZoomCanvas(img);
            });
        }.bind(this);
        reader.readAsDataURL(file);
        this.interactPhoto.movable = true;
        this.interactPhoto.canvas.selection = true;
        this.interactPhoto.canvas.defaultCursor = 'grab';
        this.interactPhoto.canvas.remove(this.interactPhoto.text);
    }
}

export { ImageChange };
