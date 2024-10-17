import { DefaultButtonFonctioner } from './default.js';


class PickPL extends DefaultButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
    }

    onClick() {
        if (!this.interactPhoto.movable)       return;
        this.ButtonFonctioner = this;
        
        this.interactPhoto.isPickingPL = !this.interactPhoto.isPickingPL;
        this.interactPhoto.tips.innerHTML = `${this.interactPhoto.isPickingCele ? '单击要选择的天体。' : ''}`;
    }
}


export { PickPL };