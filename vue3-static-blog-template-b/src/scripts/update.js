import { promises as fs } from "fs"; // 支持 Promise API
import path from "path";
import crypto from "crypto"; // 整个模块导入

// 存放网站博客markdown的源文件夹
const blogsDir = "_blogs";

// 存放博客全部分类数据的文件
const allBlogsFile = "public/all.blog.json";

// 博客排序的关键key名
const mdSerialNoKeyName = "serialNo";

// 获取当前工作目录（即根目录）下的 "_blogs" 文件夹路径
const rootDir = path.join(process.cwd(), blogsDir);

// 用于存储最终结果的对象，按 category 分组数据
const categorizedData = {};
const archives = [];
const tagsData = {};

/** ========= STEP 1 ===========*/
// 读取指定目录中的文件，如果是子目录则递归读取
async function readMarkdownFilesInDir(dirPath) {
  try {
    // 读取当前目录的所有文件和子目录
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    // 遍历每个文件/子目录
    for (const file of files) {
      if (file.isDirectory()) {
        // 如果是子目录，递归调用读取子目录的函数
        const subDirPath = path.join(dirPath, file.name);
        await readMarkdownFilesInSubDir(subDirPath);
      }
    }
  } catch (err) {
    console.error("读取目录失败:", err);
  }
}

/** ========= STEP 2 ===========*/
// 读取子目录中的 Markdown 文件并处理
async function readMarkdownFilesInSubDir(subDirPath) {
  try {
    // 读取子目录中的所有文件
    const files = await fs.readdir(subDirPath);

    // 遍历每个文件
    for (const file of files) {
      if (file.endsWith(".md")) {
        // 只处理以 .md 结尾的 Markdown 文件
        const filePath = path.join(subDirPath, file);
        await extractFrontMatter(filePath, subDirPath, file);
      }
    }
  } catch (err) {
    console.error("读取子文件夹失败:", err);
  }
}

/** ========= STEP 3 ===========*/
// 提取 Markdown 文件中的 front matter 数据
async function extractFrontMatter(filePath, subDirPath, fileName) {
  try {
    // 读取 Markdown 文件内容
    const data = await fs.readFile(filePath, "utf8");

    // 使用正则表达式提取 front matter 部分（即 YAML 格式的元数据）
    const frontMatterMatch = data.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (frontMatterMatch) {
      // 提取出 YAML 格式的内容
      const frontMatter = frontMatterMatch[1];

      try {
        // 解析 front matter 为 JavaScript 对象
        const frontMatterObject = parseFrontMatter(frontMatter);

        // 如果包含 category 和 title，则生成一个唯一的 id
        if (frontMatterObject.category && frontMatterObject.title) {
          frontMatterObject.id = generateId(
            frontMatterObject.category,
            frontMatterObject.title
          );
        }

        // 新增 'name' 属性，值为文件名（不包括扩展名）
        frontMatterObject.name = path.basename(fileName, ".md"); // 去除文件扩展名

        // 生成相对路径并添加到 path 字段
        const relativePath = path.relative(rootDir, subDirPath); // 获取相对路径
        frontMatterObject.path = path.join(blogsDir, relativePath);

        // 添加到归档数据（archives）
        archives.push(frontMatterObject);

        // 根据 category 分组数据
        if (frontMatterObject.category) {
          // 如果该类别尚未存在，则初始化为一个空数组
          if (!categorizedData[frontMatterObject.category]) {
            categorizedData[frontMatterObject.category] = [];
          }
          // 将该条目添加到对应的 category 数组中
          categorizedData[frontMatterObject.category].push(frontMatterObject);
        }

        // 根据 tags 分组数据
        if (Array.isArray(frontMatterObject.tags)) {
          // 遍历 tags 内的标签, 加入到 tagsData 的对象数组中
          for (let index = 0; index < frontMatterObject.tags.length; index++) {
            const t = frontMatterObject.tags[index];
            // 如果该类别尚未存在，则初始化为一个空数组
            if (!tagsData[t]) {
              tagsData[t] = [];
            }
            // 将该条目添加到对应的 category 数组中
            tagsData[t].push(frontMatterObject);
          }
        }
      } catch (parseErr) {
        console.error("解析 front matter 失败:", parseErr);
      }
    }
  } catch (err) {
    console.error("读取文件失败:", err);
  }
}

/** ========= STEP 4 ===========*/
// 解析 YAML 格式的 front matter 数据
function parseFrontMatter(frontMatter) {
  const lines = frontMatter.split("\n");
  const result = {};

  // 遍历每一行，提取键值对并将其存储到结果对象中
  lines.forEach((line) => {
    const [key, value] = line.split(":").map((str) => str.trim());
    if (key && value) {
      result[key] = value;
    }
  });

  // 确保 serialNo 是数字类型，以便排序时能够正确比较
  if (result[mdSerialNoKeyName]) {
    result[mdSerialNoKeyName] = parseInt(result[mdSerialNoKeyName], 10);
  }

  // 处理 tags 字段
  if (result.tags) {
    if (Array.isArray(result.tags)) {
      // 如果 tags 已经是数组，清理每个标签中的方括号并去除空格
      result.tags = result.tags
        .map((tag) => tag.replace(/[\[\]]/g, "").trim()) // 去掉方括号
        .filter((tag) => tag !== ""); // 如果标签为空字符串，则去掉该标签
    } else if (typeof result.tags === "string") {
      // 如果 tags 是字符串，将其转换为数组（以逗号分隔），并清理每个标签中的方括号
      result.tags = result.tags
        .split(",")
        .map((tag) => tag.replace(/[\[\]]/g, "").trim()) // 去掉方括号
        .filter((tag) => tag !== ""); // 如果标签为空字符串，则去掉该标签
    }
  }

  // 如果 tags 为空数组，则将其设为空数组
  if (Array.isArray(result.tags) && result.tags.length === 0) {
    result.tags = [];
  }

  return result;
}

/** ========= STEP 5 ===========*/
// 生成一个唯一的 ID，用 category 和 title 生成哈希值
function generateId(category, title) {
  // 拼接 category 和 title
  const data = `${category}-${title}`;

  // 使用 SHA256 算法生成一个唯一的哈希值
  const hash = crypto.createHash("sha256");
  hash.update(data);
  // 返回短的一个生成的哈希值
  return hash.digest("hex").slice(0, 12);
}

/** ========= STEP 6 ===========*/
// 排序并将结果写入到 JSON 文件
async function writeSortedResultsToFile() {
  try {
    // 遍历所有 category
    Object.keys(categorizedData).forEach((category) => {
      // 按 serialNo 对每个 category 下的条目排序
      categorizedData[category].sort(
        (a, b) => a[mdSerialNoKeyName] - b[mdSerialNoKeyName]
      );
    });

    // 将所有数据组织成最终结构
    const finalData = {
      archives, // 全部的文章对象
      categories: categorizedData, // 按分类分组的数据
      tags: tagsData, // 按照标签整理的数据
    };

    // 将排序后的数据写入到 public/all.blog.json 文件中
    await fs.writeFile(allBlogsFile, JSON.stringify(finalData, null, 2));
    console.log("数据已成功写入到 all.blog.json 文件。");
  } catch (err) {
    console.error("写入文件失败:", err);
  }
}

/** ========= STEP 8 ===========*/
// 启动程序，读取指定目录下的所有子目录和 Markdown 文件，处理数据并保存到文件
async function main() {
  // 读取根目录下的 "_blogs" 文件夹
  await readMarkdownFilesInDir(rootDir);
  // 完成数据处理后，将排序结果写入到 all_blogs.json 文件
  await writeSortedResultsToFile();
}

// 启动程序
main();
