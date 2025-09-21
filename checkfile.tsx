import fs from "fs";
import path from "path";
import os from "os";

const configPath = path.join(os.homedir(), ".termafilm");

export default function checkFile(filePath: string):boolean {
    if (fs.existsSync(filePath)) {
        return true;
    }
    return false;
}

