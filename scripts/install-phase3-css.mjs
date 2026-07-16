import fs from "node:fs";
const source="styles/phase3-auth.css", target="app/globals.css", marker=".guest-actions{display:flex";
if(!fs.existsSync(source)||!fs.existsSync(target)) throw new Error("CSS dosyası bulunamadı");
const current=fs.readFileSync(target,"utf8");
if(!current.includes(marker)) fs.appendFileSync(target,"\n"+fs.readFileSync(source,"utf8")+"\n");
console.log("Phase 3 CSS hazır.");
