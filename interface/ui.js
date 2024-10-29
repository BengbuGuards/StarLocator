import { InteractPhoto } from "./classes/interact.js";
import { EventManager } from './classes/EventManager.js';


let interactPhoto = new InteractPhoto();
let eventManager = new EventManager(interactPhoto);

/* interactPhoto里给星星存了一个对象数组和一个计数，
我的重构想法是，
只存一个CeleArray（继承自markerArray，因为铅垂线还会复用），
复写上增删查改的功能，减轻elements中星星类的方法复杂度和负担

现在先只处理星星的删除，点叉的逻辑：
1. 删除表格里对应的行的数据，记得处理后面的行，注意后面的行的星星id要减1
2. 删除全局星星对象数组中对应的自己
3. 全局星星数减1
4. 删除自己的标记
*/