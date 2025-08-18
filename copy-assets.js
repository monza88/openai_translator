const fs = require('fs');
const path = require('path');

function copyDir(srcDir, destDir) {
    if(!fs.existsSync(srcDir)) {
        console.error(`❌Source directory does not exist: ${srcDir}`);
        return;
    }

    fs.rmSync(destDir, { recursive : true, force : true});
    fs.mkdirSync(destDir, {recursive : true});

    fs.readdirSync(srcDir).forEach((file) => {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);

        if(fs.lstatSync(srcFile).isDirectory()) {
            copyDir(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
            console.log(`📄 Copied: ${srcFile} → ${destFile}`);
        }
    });
}

// ✅ prompts 복사
const promptSrc = path.resolve("./prompts");
const promptDest = path.resolve("lib/prompts");
copyDir(promptSrc, promptDest);

console.log("✅ Assets copied successfully!");