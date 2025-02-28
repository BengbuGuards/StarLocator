import { defineStore } from "pinia";
import { InteractPhoto } from "@/interface/classes/interact";
import { DefaultbuttonFunctioner } from "@/interface/functions/Default";
import { PickCele } from "@/interface/functions/PickCele";
import { PickPL } from "@/interface/functions/PickPL";
import { ImageChange } from "@/interface/functions/ImageChange";
import { Calc } from "@/interface/functions/Calc";
import { MoonTime } from "@/interface/functions/MoonTime";
import { CeleCoord } from "@/interface/functions/CeleCoord";
import { SelectStars } from "@/interface/functions/SelectStars";
import { RecognizeStars } from "@/interface/functions/CeleRecognition";

export const useButtonFunStore = defineStore('buttonFun', {
    state: () => ({
        buttonFunc: DefaultbuttonFunctioner,
        interactPhoto: InteractPhoto,
        defaultbuttonFunctioner: DefaultbuttonFunctioner,
        pickCele: PickCele,
        pickPL: PickPL,
        imageChange: ImageChange,
        calc: Calc,
        moonTime: MoonTime,
        celeCoord: CeleCoord,
        selectStars: SelectStars,
        recognizeStars: RecognizeStars
    }),
    actions: {
        init(interactPhoto) {
            this.interactPhoto = interactPhoto;
            this.defaultbuttonFunctioner = new DefaultbuttonFunctioner(interactPhoto);
            this.buttonFunc = this.defaultbuttonFunctioner;
            this.pickCele = new PickCele(interactPhoto);
            this.pickPL = new PickPL(interactPhoto);
            this.celeCoord = new CeleCoord(interactPhoto);
            this.imageChange = new ImageChange(interactPhoto, this.clearAllData.bind(this));
            this.calc = new Calc(interactPhoto, this.celeCoord);
            this.moonTime = new MoonTime(interactPhoto, this.celeCoord);
            this.selectStars = new SelectStars(interactPhoto);
            this.recognizeStars = new RecognizeStars(interactPhoto);
        },
        clearAllData() {
            this.buttonFunc = this.defaultbuttonFunctioner;
            this.pickCele.clearData();
            this.pickPL.clearData();
            this.calc.clearData();
            this.interactPhoto.CeleArray.clear();
        },
        changeButtonFun(buttonFun) {
            switch (buttonFun) {
                case "PickCele":
                    this.buttonFunc = this.pickCele;
                    break;
                case "PickPL":
                    this.buttonFunc = this.pickPL;
                    break;
                case "Calc":
                    this.buttonFunc = this.calc;
                    break;
                case "MoonTime":
                    this.buttonFunc = this.moonTime;
                    break;
                case "CeleCoord":
                    this.buttonFunc = this.celeCoord;
                    break;
                case "SelectStars":
                    this.buttonFunc = this.selectStars;
                    break;
                case "RecognizeStars":
                    this.buttonFunc = this.recognizeStars;
                    break;

                default:
                    this.buttonFunc = this.defaultbuttonFunctioner;
                    break;
            }
        },
        handleMouseDown(e) {
            this.buttonFunc.handleMouseDown(e);
        },
        handleMouseUp(e) {
            this.buttonFunc.handleMouseUp(e);
        },
        handleMouseMove(e) {
            this.buttonFunc.handleMouseMove(e);
        },
        handleMouseOut(e) {
            this.buttonFunc.handleMouseOut(e);
        },
        handleMouseWheel(opt) {
            this.buttonFunc.handleMouseWheel(opt);
        },
        handleResize() {
            this.buttonFunc.handleResize();
        }
    }
})
