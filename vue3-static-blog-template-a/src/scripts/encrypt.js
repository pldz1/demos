const fs = require("fs").promises;
const path = require("path");
const { config } = require("dotenv");
const { createCipheriv } = require("crypto");

/** ========= STEP 1 ===========*/
// 引入 dotenv 包 解析 .env 文件
config();

// 读取 process.env 中的所有环境变量并打印成一个对象
const envVariables = {};

// 遍历 process.env，过滤掉 Node.js 内置的环境变量，只保留用户定义的变量
for (const key in process.env) {
  if (process.env.hasOwnProperty(key) && key.startsWith("VUE_APP_")) {
    envVariables[key] = process.env[key];
  }
}

/** ========= STEP 2 ===========*/
const NEED_ENCRYPT = process.env.VUE_APP_ENCRYPT_SOURCE;
const SECRET_KEY = process.env.VUE_APP_SECRET_KEY;
const ALGORITHM = process.env.VUE_APP_ALGORITHM;

// 应该要操作的博客文件
const ALL_BLOGS_DATA_FILE = "public/all.blog.json";

// 缓存目录路径
const CACHE_DIR = `public`;
const CACHE_BLOG_DIR = `${CACHE_DIR}/_blogs`;

// 源图片位置
const SOURCE_PICS_DIR = "_pics";
const CACHE_PICS_DIR = `public/_pics`;

// 确保密钥是32字节的长度（如果密钥不够32字节，则会填充，超过则会截断）
function ensureKeyLength(key) {
  return Buffer.from(key.padEnd(32, "0").slice(0, 32), "utf-8");
}

/** ========= STEP 3 ===========*/
// 加密函数
function encryptJson(jsonObject) {
  try {
    // 将 JSON 对象转换为字符串
    const jsonString = JSON.stringify(jsonObject);

    // 创建固定的初始化向量（IV)
    const ivStr = "abcdefghijklmnopqrstuvwxyz";
    const iv = Buffer.from(ivStr.slice(0, 16), "utf-8");

    // 创建加密器
    const cipher = createCipheriv(
      ALGORITHM,
      ensureKeyLength(SECRET_KEY), // 使用确保长度为32字节的密钥
      iv
    );

    // 加密数据
    let encrypted = cipher.update(jsonString, "utf-8", "hex");
    encrypted += cipher.final("hex");

    // 返回加密后的数据，包括 IV 和密文，组合成一个 Base64 编码的字符串
    const ivHex = iv.toString("hex");
    const encryptedBase64 = Buffer.from(ivHex + encrypted, "hex").toString(
      "base64"
    );

    return encryptedBase64;
  } catch (error) {
    console.error("加密失败:", error);
  }
}

/** ========= STEP 4 ===========*/
// 读取 `public/all.blog.json` 文件并解析
async function readAllBlogs() {
  try {
    const data = await fs.readFile(ALL_BLOGS_DATA_FILE, "utf8");
    return JSON.parse(data); // 解析 JSON 数据
  } catch (error) {
    console.error(`读取 ${ALL_BLOGS_DATA_FILE} 失败:`, error);
    return null;
  }
}

/** ========= STEP 5 ===========*/
// 复制 Markdown 文件到缓存目录
async function copyMarkdownToCache(blog, encrypt = false) {
  try {
    const { path: relativePath, name, id } = blog;

    const originalFilePath = path.join(relativePath, `${name}.md`);
    const cacheFilePath = path.join(CACHE_BLOG_DIR, `${id}.md`);

    // 读取原始文件内容
    const content = await fs.readFile(originalFilePath, "utf8");

    let finalContent = content;

    // 如果需要加密，使用加密函数对内容进行加密
    if (encrypt) {
      finalContent = encryptJson(content);
    }

    // 创建 _cache 目录（如果不存在）
    await fs.mkdir(CACHE_BLOG_DIR, { recursive: true });

    // 将加密后的（或原始的）内容写入到 _cache 目录中的新文件
    await fs.writeFile(cacheFilePath, finalContent);
    console.log(`成功复制文件: ${originalFilePath} -> ${cacheFilePath}`);
  } catch (error) {
    console.error("复制文件失败:", error);
  }
}

/** ========= STEP 6 ===========*/
// 加密并保存 `all.blog.json` 文件到缓存目录
async function copyAllBlogsJsonToCache() {
  try {
    const allBlogs = await readAllBlogs();

    if (!allBlogs) {
      console.error(`无法读取 ${ALL_BLOGS_DATA_FILE} 文件`);
      return;
    }

    const encryptedJson = encryptJson(allBlogs);

    // 创建 CACHE 目录（如果不存在）
    await fs.mkdir(CACHE_DIR, { recursive: true });

    // 将加密后的 all.blog.json 写入（替换）CACHE 目录下
    await fs.writeFile(ALL_BLOGS_DATA_FILE, encryptedJson);
    console.log(`成功复制加密后的 all.blog.json 到 ${ALL_BLOGS_DATA_FILE}`);
  } catch (error) {
    console.error("复制加密后的 all.blog.json 失败:", error);
  }
}

/** ========= STEP 7 ===========*/
// 把源 markdown 用到的 图像资源从 _pics 移动到 _cache/_pics 下
async function copyAllPicsToCache() {
  try {
    // 确保目标目录存在，如果不存在则创建
    await fs.mkdir(CACHE_PICS_DIR, { recursive: true });

    // 读取源图片目录下的所有文件和子目录
    const items = await fs.readdir(SOURCE_PICS_DIR, { withFileTypes: true });

    for (const item of items) {
      const sourcePath = path.join(SOURCE_PICS_DIR, item.name);
      const destPath = path.join(CACHE_PICS_DIR, item.name);

      if (item.isFile()) {
        // 如果是文件，复制到目标目录
        await fs.copyFile(sourcePath, destPath);
        console.log(`复制图像文件资源: ${item.name}`);
      } else if (item.isDirectory()) {
        // 如果是子目录，递归处理
        await copyDirectory(sourcePath, destPath);
        console.log(`复制图像文件夹: ${item.name}`);
      }
    }

    console.log("图像资源复制到public文件夹完成.");
  } catch (error) {
    console.error("图像资源拷贝失败! ", error);
  }
}

// 递归复制目录的辅助函数
async function copyDirectory(sourceDir, targetDir) {
  try {
    // 确保目标目录存在
    await fs.mkdir(targetDir, { recursive: true });

    // 读取源目录内容
    const items = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const item of items) {
      const sourcePath = path.join(sourceDir, item.name);
      const destPath = path.join(targetDir, item.name);

      if (item.isFile()) {
        await fs.copyFile(sourcePath, destPath);
      } else if (item.isDirectory()) {
        // 递归处理子目录
        await copyDirectory(sourcePath, destPath);
      }
    }
  } catch (error) {
    console.error(`赋值文件夹失败: ${sourceDir} -> ${targetDir}`, error);
  }
}

/** ========= STEP 8 ===========*/
// 加密并保存 _data 文件夹下的所有 .json 文件
async function copyAndEncryptDataFiles() {
  try {
    const dataDir = "_data";
    const publicDataDir = "public/_data";

    // 确保目标目录存在
    await fs.mkdir(publicDataDir, { recursive: true });

    // 读取 _data 文件夹下的所有文件
    const files = await fs.readdir(dataDir);

    for (const file of files) {
      const filePath = path.join(dataDir, file);

      // 只处理 .json 文件
      if (file.endsWith(".json")) {
        // 读取原始 JSON 文件内容
        const content = await fs.readFile(filePath, "utf8");

        // 加密文件内容
        const encryptedContent = encryptJson(JSON.parse(content));

        // 目标路径
        const destFilePath = path.join(publicDataDir, file);

        // 保存加密后的文件到 public/_data 文件夹
        await fs.writeFile(destFilePath, encryptedContent);

        console.log(`成功加密并保存文件: ${filePath} -> ${destFilePath}`);
      }
    }

    console.log("所有 .json 文件加密并保存到 public/_data 文件夹完成.");
  } catch (error) {
    console.error("处理 .json 文件失败: ", error);
  }
}

/** ========= STEP 9 ===========*/
// 主函数
async function main() {
  if (NEED_ENCRYPT === "false") {
    // 1. 读取 public/all.blog.json 文件
    const allBlogs = await readAllBlogs();

    if (!allBlogs) {
      console.error("无法读取 all.blog.json 文件");
      return;
    }

    // 2. 遍历 archives 数组，复制每个博客的 Markdown 文件到 _cache 目录（不加密）
    for (const blog of allBlogs.archives) {
      // 这里假设每个 blog 对象中有 id, name 和 path
      if (blog.id && blog.name && blog.path) {
        await copyMarkdownToCache(blog, false); // 不加密
      }
    }

    // 将all.blog.json 直接写入 _cache 目录
    const allBlogsCacheFilePath = path.join(CACHE_DIR, "all.blog.json");
    await fs.writeFile(allBlogsCacheFilePath, JSON.stringify(allBlogs));
  } else if (NEED_ENCRYPT === "true") {
    // 1. 读取 public/all.blog.json 文件
    const allBlogs = await readAllBlogs();

    if (!allBlogs) {
      console.error("无法读取 all.blog.json 文件");
      return;
    }

    // 2. 遍历 archives 数组，复制每个博客的 Markdown 文件到 _cache 目录（加密）
    for (const blog of allBlogs.archives) {
      // 这里假设每个 blog 对象中有 id, name 和 path
      if (blog.id && blog.name && blog.path) {
        await copyMarkdownToCache(blog, true); // 加密
      }
    }

    // 3. 读取 public/all.blog.json 文件并加密
    await copyAllBlogsJsonToCache();
  }

  // 4. 复制图像资源到 public/_pics 下
  await copyAllPicsToCache();

  // 5. 加密并保存 _data 文件夹中的所有 JSON 文件到 public/_data
  await copyAndEncryptDataFiles();
}

// 启动程序
main();
