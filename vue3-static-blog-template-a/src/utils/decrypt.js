import { createDecipheriv } from "crypto";

const NEED_ENCRYPT = process.env.VUE_APP_ENCRYPT_SOURCE;
const SECRET_KEY = process.env.VUE_APP_SECRET_KEY;
const ALGORITHM = process.env.VUE_APP_ALGORITHM;

// 确保密钥是32字节的长度（如果密钥不够32字节，则会填充，超过则会截断）
function ensureKeyLength(key) {
  return Buffer.from(key.padEnd(32, "0").slice(0, 32), "utf-8");
}

// 解密函数
function decryptJson(encryptedBase64) {
  if (NEED_ENCRYPT === "true") {
    try {
      // 1. 将 Base64 编码的密文解码为 Buffer
      const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

      // 2. 提取 IV 和密文
      const iv = encryptedBuffer.slice(0, 16); // 前 16 字节是 IV
      const encryptedData = encryptedBuffer.slice(16); // 剩余的是密文

      // 3. 创建解密器，确保指定填充方式为 PKCS7
      const decipher = createDecipheriv(
        ALGORITHM,
        ensureKeyLength(SECRET_KEY),
        iv
      );

      // 4. 解密数据并确保正确处理填充
      let decrypted = decipher.update(encryptedData, "binary", "utf8");
      decrypted += decipher.final("utf8");

      // 5. 将解密后的数据转换回 JSON 对象
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("解密失败:", error);
      return null; // 返回 null，表示解密失败
    }
  } else {
    // 如果不需要加密，直接返回原始数据（假设此时数据是 JSON 字符串）
    return JSON.parse(encryptedBase64);
  }
}

export { decryptJson };
