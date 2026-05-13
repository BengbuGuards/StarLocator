import { ShapeObject, markerArray } from './Baseclass.js';
import { autoCompleteStarName } from '../functions/AutoComplete.js';

const MIN_STAR_ROWS = 3;

// 星体类
class CelestialBody extends ShapeObject {
    constructor(x, y, id, canvas) {
        super(x, y, id, canvas, '#FFD248', `${id}`);
        // 初始化图上名字
        this.onRename();
        // 初始化图上坐标
        this.addToTable();
    }

    /**
     * 四舍五入到指定位数
     * @param num {number} 原始数据
     * @param digits {number} 小数点后的位数
     * @returns {number} 四舍五入后的结果
     */
    round(num, digits = 0) {
        let tmp = 10 ** digits;
        return Math.round(num * tmp) / tmp;
    }

    addToTable(x = this.x, y = this.y) {
        const coordX = document.getElementById(`coordX${this.id}`);
        const coordY = document.getElementById(`coordY${this.id}`);
        coordX.value = this.round(x, 2);
        coordY.value = this.round(y, 2);
        coordX.dataset.rawValue = x;
        coordY.dataset.rawValue = y;
    }

    onMove() {
        super.onMove();

        // 修改表格内容（貌似性能不是很好）
        this.addToTable(this.point.left + 16.5, this.point.top + 16.5);
    }

    /**
     * 当表格内星星名字变动时，在图上重命名
     */
    onRename() {
        // 获取填写的名称
        let name = document.getElementById(`name${this.id}`).value; // this.id 为字符串 name数字
        // 若没填写名字，显示两位数编号
        if (name === '' || name === '\n') {
            name = this.id.toString().padStart(2, '0');
        }
        // 必须使用 set() 方法并刷新画布，否则文本更改不会显示
        this.label.set('text', name);
        this.canvas.renderAll();
    }

    remove() {
        super.remove();
    }

    removeTableData() {
        document.getElementById(`name${this.id}`).value = '';
        document.getElementById(`hAngleH${this.id}`).textContent = '';
        document.getElementById(`hAngleM${this.id}`).textContent = '';
        document.getElementById(`hAngleS${this.id}`).textContent = '';
        delete document.getElementById(`hAngleS${this.id}`).dataset.rawValue;
        document.getElementById(`declinD${this.id}`).textContent = '';
        document.getElementById(`declinM${this.id}`).textContent = '';
        document.getElementById(`declinS${this.id}`).textContent = '';
        delete document.getElementById(`declinS${this.id}`).dataset.rawValue;
        document.getElementById(`coordX${this.id}`).value = '';
        document.getElementById(`coordY${this.id}`).value = '';
        delete document.getElementById(`coordX${this.id}`).dataset.rawValue;
        delete document.getElementById(`coordY${this.id}`).dataset.rawValue;
        document.getElementById(`name${this.id}`).oninput = null;
        document.getElementById(`name${this.id}`).onfocus = null;
        document.getElementById(`coordX${this.id}`).oninput = null;
        document.getElementById(`coordY${this.id}`).oninput = null;
    }
}

class CeleArray extends markerArray {
    constructor(interactPhoto) {
        super(interactPhoto);
    }

    add(x, y) {
        const id = this.num() + 1;
        this.ensureTableRow(id);
        // 判断星星数量是否已超过表格行数
        let inputTable = document.getElementById('inputTable');
        if (!inputTable) return;
        // 创建新的星星对象
        let star = new CelestialBody(x, y, id, this.interactPhoto.canvas);
        this.array.push(star);
        // 为新添加的星星绑定与CeleArray相关的删除事件
        star.deleter
            .on('mousedown', () => {
                this.remove(star.id);
            })
            .bind(this);
        this.bindTableRow(id);
        this.interactPhoto.updateCeleStatus();
    }

    initializeTableRows() {
        for (let i = 1; i <= this.tableStarRowCount(); i++) {
            this.bindTableRow(i);
        }
        this.interactPhoto.updateCeleStatus();
    }

    tableStarRowCount() {
        const inputTable = document.getElementById('inputTable');
        return inputTable ? inputTable.rows.length - 2 : 0;
    }

    ensureTableRow(id) {
        while (this.tableStarRowCount() < id) {
            this.addEmptyRow();
        }
    }

    addEmptyRow() {
        let inputTable = document.getElementById('inputTable');
        if (!inputTable) return;

        const id = this.tableStarRowCount() + 1;
        let newRow = inputTable.insertRow(id + 1);
        newRow.innerHTML = this.createStarRowHTML(id);
        this.bindTableRow(id);
    }

    createStarRowHTML(id) {
        return `
            <td>${id}</td>
            <td><input type="text" autocomplete="new-password" class="celesNameInput table" id="name${id}" aria-label="name"></td>
            <td>
                <div class="formatedInput">
                    <div contenteditable="true" id="hAngleH${id}"></div>h
                    <div contenteditable="true" id="hAngleM${id}"></div>m
                    <div contenteditable="true" id="hAngleS${id}"></div>s
                </div>
            </td>
            <td>
                <div class="formatedInput">
                    <div contenteditable="true" id="declinD${id}"></div>°
                    <div contenteditable="true" id="declinM${id}"></div>′
                    <div contenteditable="true" id="declinS${id}"></div>″
                </div>
            </td>
            <td><input type="number" class="coordsInput table" id="coordX${id}" aria-label="x" /></td>
            <td><input type="number" class="coordsInput table" id="coordY${id}" aria-label="y" /></td>
            <td><button type="button" class="tableActionButton removeCeleRow" data-star-id="${id}">删除</button></td>
        `;
    }

    bindTableRow(id) {
        const name = document.getElementById(`name${id}`);
        const coordX = document.getElementById(`coordX${id}`);
        const coordY = document.getElementById(`coordY${id}`);
        const removeButton = document.querySelector(`.removeCeleRow[data-star-id="${id}"]`);

        if (name) {
            if (!name.dataset.autocompleteBound) {
                autoCompleteStarName(name);
                name.dataset.autocompleteBound = 'true';
            }
            name.oninput = () => {
                const star = this.array[id - 1];
                if (star) star.onRename();
            };
            name.onfocus = () => {
                const star = this.array[id - 1];
                if (!star) return;
                star.canvas.setActiveObject(star.point);
                star.canvas.renderAll();
            };
        }

        const handleCoordInput = () => {
            const x = parseFloat(coordX.value);
            const y = parseFloat(coordY.value);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;
            coordX.dataset.rawValue = x;
            coordY.dataset.rawValue = y;

            if (!this.interactPhoto.movable) {
                this.interactPhoto.tips.innerHTML = '请先拖拽星空照片到此处';
                return;
            }

            if (id <= this.num()) {
                this.array[id - 1].setRealXY(x, y);
                this.array[id - 1].point.setCoords();
                this.array[id - 1].label.setCoords();
                this.interactPhoto.canvas.renderAll();
                return;
            }

            if (id === this.num() + 1) {
                this.add(x, y);
            } else {
                this.interactPhoto.tips.innerHTML = `请先填写第 ${this.num() + 1} 行的 x、y 坐标`;
            }
        };

        if (coordX) coordX.oninput = handleCoordInput;
        if (coordY) coordY.oninput = handleCoordInput;
        if (removeButton) {
            removeButton.onclick = () => {
                this.removeTableRow(id);
            };
        }
    }

    clearTableRowData(id) {
        document.getElementById(`name${id}`).value = '';
        document.getElementById(`hAngleH${id}`).textContent = '';
        document.getElementById(`hAngleM${id}`).textContent = '';
        document.getElementById(`hAngleS${id}`).textContent = '';
        delete document.getElementById(`hAngleS${id}`).dataset.rawValue;
        document.getElementById(`declinD${id}`).textContent = '';
        document.getElementById(`declinM${id}`).textContent = '';
        document.getElementById(`declinS${id}`).textContent = '';
        delete document.getElementById(`declinS${id}`).dataset.rawValue;
        document.getElementById(`coordX${id}`).value = '';
        document.getElementById(`coordY${id}`).value = '';
        delete document.getElementById(`coordX${id}`).dataset.rawValue;
        delete document.getElementById(`coordY${id}`).dataset.rawValue;
    }

    copyTableRowData(fromId, toId) {
        document.getElementById(`name${toId}`).value = document.getElementById(`name${fromId}`).value;
        document.getElementById(`hAngleH${toId}`).textContent = document.getElementById(`hAngleH${fromId}`).textContent;
        document.getElementById(`hAngleM${toId}`).textContent = document.getElementById(`hAngleM${fromId}`).textContent;
        document.getElementById(`hAngleS${toId}`).textContent = document.getElementById(`hAngleS${fromId}`).textContent;
        document.getElementById(`declinD${toId}`).textContent = document.getElementById(`declinD${fromId}`).textContent;
        document.getElementById(`declinM${toId}`).textContent = document.getElementById(`declinM${fromId}`).textContent;
        document.getElementById(`declinS${toId}`).textContent = document.getElementById(`declinS${fromId}`).textContent;
        document.getElementById(`coordX${toId}`).value = document.getElementById(`coordX${fromId}`).value;
        document.getElementById(`coordY${toId}`).value = document.getElementById(`coordY${fromId}`).value;
        this.copyRawValue(`hAngleS${fromId}`, `hAngleS${toId}`);
        this.copyRawValue(`declinS${fromId}`, `declinS${toId}`);
        this.copyRawValue(`coordX${fromId}`, `coordX${toId}`);
        this.copyRawValue(`coordY${fromId}`, `coordY${toId}`);
    }

    copyRawValue(fromElementId, toElementId) {
        const fromElement = document.getElementById(fromElementId);
        const toElement = document.getElementById(toElementId);
        if (fromElement.dataset.rawValue === undefined) {
            delete toElement.dataset.rawValue;
        } else {
            toElement.dataset.rawValue = fromElement.dataset.rawValue;
        }
    }

    removeTableRow(id) {
        if (id <= this.num()) {
            this.array[id - 1].remove();
            this.remove(id);
            return;
        }

        let inputTable = document.getElementById('inputTable');
        if (this.tableStarRowCount() > MIN_STAR_ROWS) {
            inputTable.deleteRow(id + 1);
            for (let i = id; i <= this.tableStarRowCount(); i++) {
                this.renumberTableRow(i);
                this.bindTableRow(i);
            }
        } else {
            this.clearTableRowData(id);
            this.bindTableRow(id);
        }
        this.interactPhoto.updateCeleStatus();
    }

    renumberTableRow(id) {
        let inputTable = document.getElementById('inputTable');
        const row = inputTable.rows[id + 1];
        if (!row) return;

        row.cells[0].innerHTML = id;
        row.querySelectorAll('[id]').forEach((element) => {
            element.id = element.id.replace(/\d+$/, id);
        });
        const removeButton = row.querySelector('.removeCeleRow');
        if (removeButton) removeButton.dataset.starId = id;
    }

    /**
     * 从数组中删除指定id（从1开始计）的星星
     * 注：不处理星星标记本身的删除逻辑
     * @param {Number} id
     */
    remove(id) {
        // 先清除表格数据
        this.array[id - 1].removeTableData();
        // 对后面的星星进行 id 更新
        for (let celeBody of this.array) {
            if (celeBody.id > id) {
                this.copyTableRowData(celeBody.id, celeBody.id - 1);
                celeBody.removeTableData();
                celeBody.id--;
                celeBody.onRename();
            }
        }
        // 最后从数组中删除对应星星
        this.array.splice(id - 1, 1);
        // 删除最后一行表格
        let inputTable = document.getElementById('inputTable');
        if (inputTable.rows.length - 2 > MIN_STAR_ROWS) {
            inputTable.deleteRow(inputTable.rows.length - 1);
        }
        for (let i = 1; i <= this.tableStarRowCount(); i++) {
            this.bindTableRow(i);
        }
        this.interactPhoto.updateCeleStatus();
    }

    clear() {
        let inputTable = document.getElementById('inputTable');
        while (inputTable.rows.length - 2 > MIN_STAR_ROWS) {
            inputTable.deleteRow(inputTable.rows.length - 1);
        }
        // 清空表格数据
        for (let i = 1; i <= this.tableStarRowCount(); i++) {
            this.clearTableRowData(i);
            document.getElementById(`name${i}`).oninput = null;
            document.getElementById(`name${i}`).onfocus = null;
            document.getElementById(`coordX${i}`).oninput = null;
            document.getElementById(`coordY${i}`).oninput = null;
        }
        // 清空星星及其数组
        for (let i of this.array) {
            i.remove();
        }
        this.array = [];
        for (let i = 1; i <= this.tableStarRowCount(); i++) {
            this.bindTableRow(i);
        }
        this.interactPhoto.updateCeleStatus();
    }
}

export { CelestialBody, CeleArray };
