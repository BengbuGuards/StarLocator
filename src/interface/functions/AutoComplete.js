import { starZH2EN } from "../../core/AstroCoord/starZH2EN.js";
function autoCompleteStarName(inp) {
    /*从英汉对照表获取所有名称，并去重*/
    var arr = Object.keys(starZH2EN).concat(Object.values(starZH2EN));
    arr = Array.from(new Set(arr))
    var currentFocus;
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false; }
        currentFocus = 0;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "-autocomplete");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        b = document.createElement("DIV");
        b.setAttribute("class", "autocomplete-list");
        b.setAttribute("id", this.id + "-autocomplete-list");
        a.appendChild(b);
        a = b;
        var autoCompleteList = [];
        for (i = 0; i < arr.length; i++) {
            /*寻找子字符串*/
            var pos = arr[i].toUpperCase().indexOf(val.toUpperCase());
            if (pos >= 0) {
                autoCompleteList.push({ name: arr[i], pos: pos });
            }
        }
        autoCompleteList.sort(function (first, second) {
            return first.pos - second.pos;
        })

        autoCompleteList.forEach(element => {
            b = document.createElement("DIV");
            b.innerHTML += element.name;
            b.innerHTML += "<input type='hidden' value='" + element.name + "'>";
            b.addEventListener("click", function (e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.dispatchEvent(new Event("input"));
                closeAllLists();
            });
            a.appendChild(b);
        }
        )
    });
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "-autocomplete");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) { //down
            e.preventDefault();
            currentFocus++;
            addActive(x);
            fixScrolling(x);
        } else if (e.keyCode == 38) { //up
            e.preventDefault();
            currentFocus--;
            addActive(x);
            fixScrolling(x);
        } else if (e.keyCode == 13) { //enter
            e.preventDefault();
            if (currentFocus > 0) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function fixScrolling(x){
        if (!x) return false;
        var l = document.getElementsByClassName("autocomplete-list")[0];
        var singleItemHeight = l.scrollHeight / (x.length - 1);
        console.info((currentFocus-1)*singleItemHeight);
        if ((currentFocus-1)*singleItemHeight >= l.scrollTop + l.clientHeight-singleItemHeight){
            l.scrollTop = (currentFocus-1-4)*singleItemHeight;
        }
        if ((currentFocus-1)*singleItemHeight < l.scrollTop){
            l.scrollTop = Math.max(0,(currentFocus-1)*singleItemHeight);
        }
    }
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 1;
        if (currentFocus < 1) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

export { autoCompleteStarName };