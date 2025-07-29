const fs = require('fs');
const path = require('path');

const src = path.resolve(process.cwd(), "prompts");
const dest = path.resolve(process.cwd(), "lib/prompts");

if(!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

fs.readdirSync(src).forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.lstatSync(srcFile).isDirectory()) {
        fs.mkdirSync(destFile, { recursive: true });
        fs.readdirSync(srcFile).forEach(subFile => {
            fs.copyFileSync(path.join(srcFile, subFile), path.join(destFile, subFile));
        });
    } else {
        fs.copyFileSync(srcFile, destFile);
    }
});

console.log(`Assets copied from ${src} to ${dest}`);