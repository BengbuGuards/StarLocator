import { ButtonFonctioner } from "../classes/ButtionFunctioner.js";


class PickCele extends ButtonFonctioner{
    constructor(interactPhoto){
        super(interactPhoto);
    }

    onClick() {
        if (!this.interactPhoto.movable)       return;
        this.interactPhoto.isPickingCele = !this.interactPhoto.isPickingCele;
        this.interactPhoto.tips.innerHTML = `${this.interactPhoto.isPickingCele ? '单击要选择的天体。' : ''}`;
        this.ButtonFonctioner = this;
    }
}


export { PickCele };