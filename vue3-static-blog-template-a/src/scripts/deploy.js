const fs = require("fs");
const path = require("path");

// 定义文件夹路径
const projectRoot = path.join(__dirname, "../../");
const distPath = path.join(projectRoot, "dist");

// 定义 .nojekyll 文件的路径
const nojekyllFilePath = path.join(distPath, ".nojekyll");

function main() {
  // 确保 dist 目录存在
  if (!fs.existsSync(distPath)) {
    console.log(`目录 ${distPath} 不存在，正在创建...`);
    fs.mkdirSync(distPath, { recursive: true });
  }

  // 创建 .nojekyll 文件
  fs.writeFile(nojekyllFilePath, "", (err) => {
    if (err) {
      console.error("创建 .nojekyll 文件时出错:", err);
    } else {
      console.log(".nojekyll 文件已创建:", nojekyllFilePath);
    }
  });
}

main();
