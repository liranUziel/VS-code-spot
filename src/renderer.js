const openBtn = document.getElementById("open");
const input = document.getElementById("path");
const tooltip = document.getElementById("tooltip");

let highlightedIndex = 0;
let right = "";
let left = "";
let options = {};

input.focus();

input.addEventListener("input", () => {
    const filepath = input.value;
    window.electronAPI.checkPath(filepath);
});

window.electronAPI.onCheckPathResolve((_options) => {
    tooltip.innerHTML = "";
    options = _options;
    if (options.options.length === 0) {
        tooltip.style.display = "none";
        input.classList.toggle("error");
    } else {
        input.classList.toggle("error");
        console.log(`this is the option`);
        left = options.dirpath + (options.dirpath.endsWith("\\") ? "" : "\\");
        options.options.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = option.name;
            if (index === 0) {
                li.classList.add("highlight");
                right = option.name + (option.type === "directory" ? "\\" : "");
            }
            tooltip.appendChild(li);
        });
        tooltip.style.display = "block";
    }
});

window.addEventListener("keydown", (event) => {
    const lis = Array.from(tooltip.getElementsByTagName("li"));
    if (event.key === "ArrowDown") {
        highlightedIndex = Math.min(highlightedIndex + 1, lis.length - 1);
        const option = options.options[highlightedIndex];
        right = option.name + (option.type === "directory" ? "\\" : "");
    } else if (event.key === "ArrowUp") {
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        right = option.name + (option.type === "directory" ? "\\" : "");
    } else if (event.key === "Tab") {
        event.preventDefault();
        input.value = left + right;
        tooltip.style.display = "none";
    } else if (event.key === "Enter") {
        window.electronAPI.openVsCode(left + right);
    }
    lis.forEach((li, index) => {
        if (index === highlightedIndex) {
            li.classList.add("highlight");
        } else {
            li.classList.remove("highlight");
        }
    });
});
