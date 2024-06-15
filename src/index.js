// Import required modules
const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Declare global variables
let mainWindow;

// Function to create a new window
function createWindow() {
    // Create a new BrowserWindow
    mainWindow = new BrowserWindow({
        y: -600,
        frame: false,
        transparent: true,
        resizable: false,
        backgroundColor: "#00000000",
        icon: path.join(__dirname, "./assets/vs-spot_f.ico"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    // Register global shortcut
    globalShortcut.register("Escape", () => {
        mainWindow.close();
    });

    // IPC event handlers
    ipcMain.on("open-new-vs-code", handleOpenNewVsCode);
    ipcMain.on("check-path", handleCheckPath);

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, "index.html"));

    // Animate the window opening
    animateWindowOpening();
}

// Function to handle the "open-new-vs-code" event
function handleOpenNewVsCode(event, dirpath) {
    // Check if dirpath is a valid path
    if (!fs.existsSync(dirpath)) {
        return;
    }

    // Open a new VS Code window
    require("child_process").exec("code " + dirpath);

    // Close the current window
    mainWindow.close();
}

// Function to handle the "check-path" event
function handleCheckPath(event, filepath) {
    // Split the filepath at the last occurrence of '\\'
    const lastIndex = filepath.lastIndexOf("\\");
    let left, right;
    if (lastIndex !== -1) {
        left = filepath.substring(0, lastIndex);
        right = filepath.substring(lastIndex + 1);
    } else {
        // If no '\\' is found, the whole string goes to left, and right is empty
        left = filepath;
        right = "";
    }

    // Check if the left part of the filepath exists
    if (fs.existsSync(left)) {
        if (left.endsWith(":")) {
            left += "\\";
        }

        // Resolve the absolute path and read the directory
        const absulutePath = path.resolve(left);
        const files = fs.readdirSync(absulutePath);

        // Filter the files based on the right part of the filepath
        const options = [];
        files.forEach((file) => {
            if (file.toLowerCase().startsWith(right.toLowerCase())) {
                const filePath = path.join(absulutePath, file);
                let fileType = "unknown";
                try {
                    const stats = fs.statSync(filePath);
                    if (stats.isFile()) {
                        fileType = "file";
                    } else if (stats.isDirectory()) {
                        fileType = "directory";
                    }
                    options.push({ name: file, type: fileType });
                } catch (error) {}
            }
        });

        // Reply with the filtered options
        event.reply("check-path-resolve", {
            options: options.splice(0, 5),
            dirpath: absulutePath,
        });
    }
}

// Function to animate the window opening
function animateWindowOpening() {
    let position = -600;
    const interval = setInterval(() => {
        position += 10;
        mainWindow.setPosition(mainWindow.getPosition()[0], position);
        if (position >= 0) {
            clearInterval(interval);
        }
    }, 10);
}

// App event handlers
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
