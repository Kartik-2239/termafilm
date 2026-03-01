import fs from "fs";
import path from "path";
import os from "os";

const configPath = path.join(os.homedir(), ".termafilm");

export function checkFile(filePath: string):boolean {
    if (fs.existsSync(filePath)) {
        return true;
    }
    return false;
}

export function checkFolder(folderPath: string):boolean {
    if (fs.existsSync(folderPath)) {
        return true;
    }
    return false;
}