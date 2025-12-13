<template>
  <div class="admin-card">
    <img :size="50" :src="author.avatar" class="avatar" />
    <div class="admin-description">
      <h3>{{ author.name }}</h3>
      <p>{{ author.signature }}</p>
    </div>

    <!-- 发表的文章信息 -->
    <div class="blog-info-container">
      <div class="blog-info">
        <p>{{ `文章: ${blogsCount}` }}</p>
      </div>
      <div class="blog-info">
        <p>{{ `Code Space : ${codespaceCount}` }}</p>
      </div>
    </div>

    <!-- 社交软件图标 -->
    <div class="social-icon-container">
      <div></div>
      <!-- GitHub -->
      <a :href="author.githubUrl" target="_blank" rel="noopener noreferrer">
        <div v-html="github32" class="icon-32 social-icon"></div
      ></a>

      <!-- CSDN -->
      <a :href="author.csdnUrl" target="_blank" rel="noopener noreferrer">
        <div v-html="csdn32" class="icon-32 social-icon"></div>
      </a>

      <!-- 掘金社区 -->
      <a :href="author.juejinUrl" target="_blank" rel="noopener noreferrer">
        <div v-html="juejin32" class="icon-32 social-icon"></div>
      </a>

      <!-- Gitee -->
      <a :href="author.giteeUrl" target="_blank" rel="noopener noreferrer">
        <div v-html="gitee32" class="icon-32 social-icon"></div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { csdn32, github32, juejin32, gitee32 } from "@/assets/svg";

const store = useStore();

const author = store.state.websiteAbout.author;
const blogsCount = store.state.blogsAbout.archives.length;
const codespaceCount = Object.keys(store.state.codespaceAbout.data).length;
</script>

<style scoped>
.admin-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--card-box-shadow);
  text-align: center;
  height: auto;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  transition: transform 0.5s ease-out;
  -webkit-transition: transform 0.6s ease-out;
  -moz-transition: transform 0.5s ease-out;
  -ms-transition: transform 0.5s ease-out;
  -o-transition: transform 0.5s ease-out;
}

.avatar:hover {
  -webkit-transform: rotate(360deg);
  -moz-transform: rotate(360deg);
  -ms-transform: rotate(360deg);
  -o-transform: rotate(360deg);
  transform: rotate(360deg);
}

.admin-description h3 {
  margin: 0px;
  overflow: hidden;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.admin-description p {
  margin: 4px;
  font-size: 14px;
  color: #555;
  overflow: hidden;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.blog-info-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0% 8%;
  margin-bottom: 10px;
  margin-top: 0;
}

.blog-info {
  margin: 0 5%;
}

.blog-info p:nth-child(1) {
  margin-bottom: 0;
}

.blog-info p:nth-child(2) {
  margin-top: 5px;
}

.social-icon-container {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
}

.social-icon {
  transition: all 0.3s;
  cursor: pointer;
  transform: translateY(0);
}

.social-icon:hover {
  transform: translateY(-5px);
}
</style>
