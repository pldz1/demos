import CryptoJS from "crypto-js";

const NEED_ENCRYPT = import.meta.env.VITE_ENCRYPT_SOURCE;
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// 处理密钥，补足为 32 字节
function getCryptoKey(key) {
  return CryptoJS.enc.Utf8.parse(key.padEnd(32, "0").slice(0, 32));
}

// 解密函数
function decryptJson(encryptedBase64) {
  if (NEED_ENCRYPT === "true") {
    try {
      // Base64 解码后拿到原始二进制数据
      const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedBase64);

      // 提取 IV（前 16 字节）和密文体
      const iv = CryptoJS.lib.WordArray.create(
        encryptedBytes.words.slice(0, 4), // 每个 word 是 4 字节
        16
      );
      const ciphertext = CryptoJS.lib.WordArray.create(
        encryptedBytes.words.slice(4),
        encryptedBytes.sigBytes - 16
      );

      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext },
        getCryptoKey(SECRET_KEY),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const decryptedText = CryptoJS.enc.Utf8.stringify(decrypted);

      return JSON.parse(decryptedText);
    } catch (err) {
      console.error("crypto-js 解密失败:", err);
      return null;
    }
  } else {
    return JSON.parse(encryptedBase64);
  }
}

export { decryptJson };
