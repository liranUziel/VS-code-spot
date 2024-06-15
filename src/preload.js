const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    checkPath: (filepath) => ipcRenderer.send("check-path", filepath),
    openVsCode: (filepath) => ipcRenderer.send("open-new-vs-code", filepath),
    onCheckPathResolve: (func) => {
        ipcRenderer.on("check-path-resolve", (event, options) => func(options));
    },
});
