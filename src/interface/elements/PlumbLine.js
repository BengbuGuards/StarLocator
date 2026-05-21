import { ShapeObject, LineObject, markerArray } from './Baseclass.js';

// 线端点类
class PLpoint extends ShapeObject {
    constructor(coordinate, interactPhoto, canvas, id, color) {
        super(coordinate[0], coordinate[1], id, canvas, color, '');
        this.coordinate = coordinate;
        this.interactPhoto = interactPhoto;
    }

    onMove() {
        super.onMove();
        this.coordinate = [this.point.left + 16.5, this.point.top + 16.5];
    }
}

// 端点线类
class PLLine {
    constructor(interactPhoto) {
        this.interactPhoto = interactPhoto;
        this.points = [];
        this.lineObject = null;
    }

    // 添加线段移动事件，通常是在添加第二个点后调用
    addMoveLineEvent() {
        this.points[0].point.off('moving');
        this.points[1].point.off('moving');
        this.points[0].point.on('moving', this.onMovePoint.bind(this, this.points[0]));
        this.points[1].point.on('moving', this.onMovePoint.bind(this, this.points[1]));
    }

    // 点移动事件，用于更新线段位置，通常在点移动时调用
    onMovePoint(PLpoint) {
        PLpoint.onMove();
        // 更新线的位置
        let line = this.lineObject.line;
        line.set({
            x1: this.points[0].coordinate[0],
            y1: this.points[0].coordinate[1],
            x2: this.points[1].coordinate[0],
            y2: this.points[1].coordinate[1],
        });
        line.setCoords(); // 更新线的位置
        this.interactPhoto.canvas.renderAll(); // 刷新画布以显示更改

        // 更新对应表格行的内容
        let lineId = Math.floor(PLpoint.id / 2) + 1;
        this.interactPhoto.PLArray.updateTableRow(lineId);
    }

    // 删除本端点线
    remove() {
        this.points.forEach((point) => point.remove());
        if (this.lineObject != null) {
            this.lineObject.remove();
        }
    }
}

const MIN_PL_ROWS = 2;

class PLArray extends markerArray {
    constructor(interactPhoto) {
        super(interactPhoto);
    }

    round(num, digits = 0) {
        let tmp = 10 ** digits;
        return Math.round(num * tmp) / tmp;
    }

    add(coordinate) {
        // 如果数组为空或者最后一个线段已经有两个点了，就新建一个线段
        if (this.array.length == 0 || this.array.slice(-1)[0].points.length == 2) {
            let pl = new PLLine(this.interactPhoto);
            this.array.push(pl);
        }
        // 获取当前最后一个线段
        let lastPLLine = this.array.slice(-1)[0];

        let newPointID = this.num() * 2 - 2 + lastPLLine.points.length;
        // 添加点
        let newpPoint = new PLpoint(coordinate, this.interactPhoto, this.interactPhoto.canvas, newPointID, '#35dc96');
        lastPLLine.points.push(newpPoint);

        let lineId = this.array.length;
        this.ensurePLTableRow(lineId);

        // 如果有了两个端点，就添加线段
        if (lastPLLine.points.length == 2) {
            let lineCoord = [lastPLLine.points[0].coordinate, lastPLLine.points[1].coordinate].flat();
            lastPLLine.lineObject = new LineObject(lineCoord, this.interactPhoto.canvas, '#35dc96');
            lastPLLine.addMoveLineEvent();
            this.interactPhoto.updateCalculButton();
        } else if (lastPLLine.points.length > 2) {
            console.error('Too many points in a line.');
        }

        // 绑定删除按钮事件
        newpPoint.deleter
            .on('mousedown', () => {
                this.remove(newpPoint.id);
            })
            .bind(this);

        this.updateTableRow(lineId);
    }

    remove(id) {
        let deletedId = Math.floor(id / 2);
        this.array[deletedId].remove();
        // 删除对应的线段
        this.array.splice(deletedId, 1);
        // 更新后面的线中的点的 ID
        for (let i = deletedId; i < this.num(); ++i) {
            for (let j = 0; j < this.array[i].points.length; ++j) {
                this.array[i].points[j].id -= 2;
            }
        }

        // 更新表格行
        let plInputTable = document.getElementById('plInputTable');
        if (this.tablePLRowCount() > MIN_PL_ROWS) {
            plInputTable.deleteRow(deletedId + 1);
            for (let i = deletedId + 1; i <= this.tablePLRowCount(); i++) {
                this.renumberPLTableRow(i);
                this.bindPLTableRow(i);
            }
        } else {
            this.clearPLTableRowData(deletedId + 1);
            this.bindPLTableRow(deletedId + 1);
        }

        // 刷新所有已存线在表格中的数值，并清空多余行的数值
        for (let i = 1; i <= this.tablePLRowCount(); i++) {
            if (i <= this.num()) {
                this.updateTableRow(i);
            } else {
                this.clearPLTableRowData(i);
            }
        }

        this.interactPhoto.updateCalculButton();
    }

    initializeTableRows() {
        for (let i = 1; i <= this.tablePLRowCount(); i++) {
            this.bindPLTableRow(i);
        }
    }

    tablePLRowCount() {
        const plInputTable = document.getElementById('plInputTable');
        return plInputTable ? plInputTable.rows.length - 1 : 0;
    }

    ensurePLTableRow(id) {
        while (this.tablePLRowCount() < id) {
            this.addEmptyRow();
        }
    }

    addEmptyRow() {
        let plInputTable = document.getElementById('plInputTable');
        if (!plInputTable) return;

        const id = this.tablePLRowCount() + 1;
        let newRow = plInputTable.insertRow(id);
        newRow.innerHTML = this.createPLRowHTML(id);
        this.bindPLTableRow(id);
    }

    createPLRowHTML(id) {
        return `
            <td>${id}</td>
            <td><input type="number" class="coordsInput table" id="pl${id}_x1" aria-label="pl${id}_x1" /></td>
            <td><input type="number" class="coordsInput table" id="pl${id}_y1" aria-label="pl${id}_y1" /></td>
            <td><input type="number" class="coordsInput table" id="pl${id}_x2" aria-label="pl${id}_x2" /></td>
            <td><input type="number" class="coordsInput table" id="pl${id}_y2" aria-label="pl${id}_y2" /></td>
            <td><button type="button" class="tableActionButton removePlRow" data-pl-id="${id}">删除</button></td>
        `;
    }

    bindPLTableRow(id) {
        const x1Input = document.getElementById(`pl${id}_x1`);
        const y1Input = document.getElementById(`pl${id}_y1`);
        const x2Input = document.getElementById(`pl${id}_x2`);
        const y2Input = document.getElementById(`pl${id}_y2`);
        const removeButton = document.querySelector(`.removePlRow[data-pl-id="${id}"]`);

        const handlePLCoordInput = () => {
            const x1 = parseFloat(x1Input.value);
            const y1 = parseFloat(y1Input.value);
            const x2 = parseFloat(x2Input.value);
            const y2 = parseFloat(y2Input.value);

            if (!this.interactPhoto.movable) {
                this.interactPhoto.tips.innerHTML = '请先拖拽星空照片到此处';
                return;
            }

            // 确保 this.array 拥有足够的 PLLine 对象
            while (this.array.length < id) {
                this.array.push(new PLLine(this.interactPhoto));
            }

            let pl = this.array[id - 1];

            // 处理第一个端点
            if (Number.isFinite(x1) && Number.isFinite(y1)) {
                if (pl.points[0]) {
                    pl.points[0].setRealXY(x1, y1);
                } else {
                    let newPointID = (id - 1) * 2;
                    let newPoint = new PLpoint(
                        [x1, y1],
                        this.interactPhoto,
                        this.interactPhoto.canvas,
                        newPointID,
                        '#35dc96'
                    );
                    pl.points.push(newPoint);
                    newPoint.deleter.on('mousedown', () => {
                        this.remove(newPoint.id);
                    });
                }
            }

            // 处理第二个端点
            if (Number.isFinite(x2) && Number.isFinite(y2)) {
                if (pl.points[1]) {
                    pl.points[1].setRealXY(x2, y2);
                } else if (pl.points[0]) {
                    let newPointID = (id - 1) * 2 + 1;
                    let newPoint = new PLpoint(
                        [x2, y2],
                        this.interactPhoto,
                        this.interactPhoto.canvas,
                        newPointID,
                        '#35dc96'
                    );
                    pl.points.push(newPoint);
                    newPoint.deleter.on('mousedown', () => {
                        this.remove(newPoint.id);
                    });
                }
            }

            // 更新或创建线段
            if (pl.points.length === 2) {
                if (pl.lineObject) {
                    let line = pl.lineObject.line;
                    line.set({
                        x1: pl.points[0].coordinate[0],
                        y1: pl.points[0].coordinate[1],
                        x2: pl.points[1].coordinate[0],
                        y2: pl.points[1].coordinate[1],
                    });
                    line.setCoords();
                } else {
                    let lineCoord = [pl.points[0].coordinate, pl.points[1].coordinate].flat();
                    pl.lineObject = new LineObject(lineCoord, this.interactPhoto.canvas, '#35dc96');
                    pl.addMoveLineEvent();
                }
            }

            this.interactPhoto.canvas.renderAll();
            this.interactPhoto.updateCalculButton();
        };

        if (x1Input) x1Input.oninput = handlePLCoordInput;
        if (y1Input) y1Input.oninput = handlePLCoordInput;
        if (x2Input) x2Input.oninput = handlePLCoordInput;
        if (y2Input) y2Input.oninput = handlePLCoordInput;

        if (removeButton) {
            removeButton.onclick = () => {
                this.removePLTableRow(id);
            };
        }
    }

    updateTableRow(id) {
        let pl = this.array[id - 1];
        if (!pl) return;

        const x1Input = document.getElementById(`pl${id}_x1`);
        const y1Input = document.getElementById(`pl${id}_y1`);
        const x2Input = document.getElementById(`pl${id}_x2`);
        const y2Input = document.getElementById(`pl${id}_y2`);

        if (pl.points[0] && x1Input && y1Input) {
            x1Input.value = this.round(pl.points[0].coordinate[0], 2);
            y1Input.value = this.round(pl.points[0].coordinate[1], 2);
        } else if (x1Input && y1Input) {
            x1Input.value = '';
            y1Input.value = '';
        }
        if (pl.points[1] && x2Input && y2Input) {
            x2Input.value = this.round(pl.points[1].coordinate[0], 2);
            y2Input.value = this.round(pl.points[1].coordinate[1], 2);
        } else if (x2Input && y2Input) {
            x2Input.value = '';
            y2Input.value = '';
        }
    }

    clearPLTableRowData(id) {
        const x1 = document.getElementById(`pl${id}_x1`);
        const y1 = document.getElementById(`pl${id}_y1`);
        const x2 = document.getElementById(`pl${id}_x2`);
        const y2 = document.getElementById(`pl${id}_y2`);
        if (x1) x1.value = '';
        if (y1) y1.value = '';
        if (x2) x2.value = '';
        if (y2) y2.value = '';
    }

    removePLTableRow(id) {
        if (id <= this.num()) {
            this.array[id - 1].remove();
            this.remove((id - 1) * 2); // delete first point's ID to trigger remove of the whole PLLine
            return;
        }

        let plInputTable = document.getElementById('plInputTable');
        if (this.tablePLRowCount() > MIN_PL_ROWS) {
            plInputTable.deleteRow(id);
            for (let i = id; i <= this.tablePLRowCount(); i++) {
                this.renumberPLTableRow(i);
                this.bindPLTableRow(i);
            }
        } else {
            this.clearPLTableRowData(id);
            this.bindPLTableRow(id);
        }
    }

    renumberPLTableRow(id) {
        let plInputTable = document.getElementById('plInputTable');
        const row = plInputTable.rows[id];
        if (!row) return;

        row.cells[0].innerHTML = id;
        row.querySelectorAll('[id]').forEach((element) => {
            element.id = element.id.replace(/^pl\d+/, `pl${id}`);
        });
        const removeButton = row.querySelector('.removePlRow');
        if (removeButton) removeButton.dataset.plId = id;
    }

    clear() {
        let plInputTable = document.getElementById('plInputTable');
        while (plInputTable.rows.length - 1 > MIN_PL_ROWS) {
            plInputTable.deleteRow(plInputTable.rows.length - 1);
        }
        for (let i = 1; i <= this.tablePLRowCount(); i++) {
            this.clearPLTableRowData(i);
            const x1Input = document.getElementById(`pl${i}_x1`);
            const y1Input = document.getElementById(`pl${i}_y1`);
            const x2Input = document.getElementById(`pl${i}_x2`);
            const y2Input = document.getElementById(`pl${i}_y2`);
            if (x1Input) x1Input.oninput = null;
            if (y1Input) y1Input.oninput = null;
            if (x2Input) x2Input.oninput = null;
            if (y2Input) y2Input.oninput = null;
        }
        for (let i of this.array) {
            i.remove();
        }
        this.array = [];
        for (let i = 1; i <= this.tablePLRowCount(); i++) {
            this.bindPLTableRow(i);
        }
        this.interactPhoto.updateCalculButton();
    }
}

export { PLpoint, PLLine, PLArray };
