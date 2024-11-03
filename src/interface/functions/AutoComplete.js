import { starZH2EN } from "../../core/AstroCoord/starZH2EN.js";

function autoCompleteStarName(inp) {
    /*从英汉对照表获取所有名称，并去重*/
    var arrAllStarNames = Object.keys(starZH2EN).concat(Object.values(starZH2EN));
    arrAllStarNames = Array.from(new Set(arrAllStarNames))
    var currentFocus;  // 当前焦点

    /*输入框输入时，自动显示实时补全项*/
    inp.addEventListener("input", function (e) {
        var divA, divB, val = this.value;
        closeAllLists();
        if (!val) { return false; }  // 如果输入框为空，直接返回
        currentFocus = 0;
        /*
        创建一个DIV邻元素，作为自动补全项的容器
        结构如下：
        <div id="id-autocomplete" class="autocomplete-items">
            <div id="id-autocomplete-list" class="autocomplete-list">...</div>
        */
        divA = document.createElement("DIV");
        divA.setAttribute("id", this.id + "-autocomplete");
        divA.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(divA);
        divB = document.createElement("DIV");
        divB.setAttribute("class", "autocomplete-list");
        divB.setAttribute("id", this.id + "-autocomplete-list");
        divA.appendChild(divB);
        /* 遍历所有星星名称，找到包含输入值的星星名称 */
        var autoCompleteList = [];
        for (let i = 0; i < arrAllStarNames.length; i++) {
            /*寻找子字符串*/
            var pos = arrAllStarNames[i].toUpperCase().indexOf(val.toUpperCase());
            if (pos >= 0) {
                autoCompleteList.push({ name: arrAllStarNames[i], pos: pos });
            }
        }
        autoCompleteList.sort(function (first, second) {
            return first.pos - second.pos;
        })

        /* 创建自动补全项 */
        autoCompleteList.forEach(element => {
            let divItem = document.createElement("DIV");
            divItem.innerHTML += element.name;
            divItem.innerHTML += "<input type='hidden' value='" + element.name + "'>";
            divItem.addEventListener("click", function (e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.dispatchEvent(new Event("input"));
                closeAllLists();
            });
            divB.appendChild(divItem);
        }
        )
    });

    /*键盘事件*/
    inp.addEventListener("keydown", function (e) {
        let divA = document.getElementById(this.id + "-autocomplete");
        if (divA) var items = divA.getElementsByTagName("div");
        if (e.keyCode == 40) { //down
            e.preventDefault();
            currentFocus++;
            addActive(items);
            fixScrolling(items);
        } else if (e.keyCode == 38) { //up
            e.preventDefault();
            currentFocus--;
            addActive(items);
            fixScrolling(items);
        } else if (e.keyCode == 13) { //enter
            e.preventDefault();
            if (currentFocus > 0) {
                if (items) items[currentFocus].click();
            }
        }
    });

    /*点击其他地方关闭自动补全项候选框*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
    
    /*修正滚动条位置*/
    function fixScrolling(item){
        if (!item) return false;
        var l = document.getElementsByClassName("autocomplete-list")[0];
        var singleItemHeight = l.scrollHeight / (item.length - 1);
        console.info((currentFocus-1)*singleItemHeight);
        if ((currentFocus-1)*singleItemHeight >= l.scrollTop + l.clientHeight-singleItemHeight){
            l.scrollTop = (currentFocus-1-4)*singleItemHeight;
        }
        if ((currentFocus-1)*singleItemHeight < l.scrollTop){
            l.scrollTop = Math.max(0,(currentFocus-1)*singleItemHeight);
        }
    }
    
    /*添加active*/
    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 1;
        if (currentFocus < 1) currentFocus = (items.length - 1);
        items[currentFocus].classList.add("autocomplete-active");
    }

    /*移除所有active*/
    function removeActive(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }
    }

    /*关闭自动补全项候选框*/
    function closeAllLists(elmnt) {
        let divA = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < divA.length; i++) {
            if (elmnt != divA[i] && elmnt != inp) {
                divA[i].parentNode.removeChild(divA[i]);
            }
        }
    }
}

export { autoCompleteStarName };