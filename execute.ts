import { exec } from "child_process";

function execute(command: string, quiet: boolean) {
    return new Promise<void>((resolve, reject) => {
        const child =exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (quiet === false) {
                console.log(stderr || "")
                console.log(stdout || "");
            }
            resolve(void 0);
        });
    });
}


export default execute;