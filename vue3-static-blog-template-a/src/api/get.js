import axios from "axios";
import { decryptJson } from "../utils/decrypt";

const staticAllBlogsDataFile = "/all.blog.json";

const blogFilePath = "/_blogs";

const apiFileData = "/_data";

// 获取并解密 all.blog.json 文件
async function getAllBlogsData() {
  try {
    // 1. 使用 axios 发起 GET 请求获取加密的 all.blog.json
    const response = await axios.get(staticAllBlogsDataFile);
    const encryptedData = response.data; // 假设返回的是加密后的 Base64 字符串

    // 2. 使用 decryptJson 解密得到 allBlogs 变量
    const allBlogs = decryptJson(encryptedData);

    if (!allBlogs) {
      console.error("解密失败，无法获取 allBlogs 数据");
      return;
    }

    // 3. 返回解密后的 allBlogs 数据
    return allBlogs;
  } catch (error) {
    console.error("获取或解密 all.blog.json 文件失败:", error);
    return null;
  }
}

// 获取并解密 博客的 markdown 文件
async function getBlogMdData(id) {
  try {
    // 1. 使用 axios 发起 GET 请求获取加密的 all.blog.json
    const response = await axios.get(`${blogFilePath}/${id}.md`);
    const encryptedData = response.data; // 假设返回的是加密后的 Base64 字符串

    // 2. 使用 decryptJson 解密得到 markdown 文件的值
    const md = decryptJson(encryptedData);

    if (!md) {
      console.error("解密失败，无法获取博客文章数据");
      return;
    }

    // 3. 返回解密后并且移除 yaml 数据的 md 数据
    return md.replace(/^---[\s\S]*?---\s*/, "").trim();
  } catch (error) {
    console.error("获取或解密博客文件失败:", error);
    return null;
  }
}

// 获取并解密 _data/xxx.json 文件
async function getAPIData(name) {
  try {
    // 1. 使用 axios 发起 GET 请求获取文件
    const response = await axios.get(`${apiFileData}/${name}`);
    const encryptedData = response.data;

    // 2. 使用 decryptJson 解密得到 全部的 privacy.json 变量
    const allData = decryptJson(encryptedData);

    if (!allData) {
      console.error("解密失败，无法获取 API 文件数据");
      return;
    }

    // 3. 返回解密后的 allBlogs 数据
    return allData;
  } catch (error) {
    console.error("获取或解密 API 文件失败:", error);
    return null;
  }
}

export { getAllBlogsData, getBlogMdData, getAPIData };
