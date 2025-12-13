<template>
  <div class="admin-card">
    <el-avatar
      :size="50"
      :src="websiteAuthorInfo.avatar"
      class="avatar"
    ></el-avatar>
    <div class="admin-description">
      <h3>{{ websiteAuthorInfo.name }}</h3>
      <p>{{ websiteAuthorInfo.signature }}</p>
    </div>

    <!-- 发表的文章信息 -->
    <div class="article-info-container">
      <div class="article-info">
        <p>文章</p>
        <p>{{ blogsCount }}</p>
      </div>
      <div class="article-info">
        <p>分类</p>
        <p>{{ blogsCategories }}</p>
      </div>
      <div class="article-info">
        <p>标签</p>
        <p>{{ blogsTags }}</p>
      </div>
    </div>

    <!-- 在 github 上 follow -->
    <el-button type="primary" class="follow-button" @click="gotoGithub"
      ><font-awesome-icon :icon="['fab', 'github']" class="github-icon" />Follow
      Me</el-button
    >

    <!-- 社交软件图标 -->
    <div class="social-icon-container">
      <!-- CSDN -->
      <a :href="websiteAuthorInfo.csdnUrl">
        <i class="csdn"></i>
      </a>

      <!-- GitHub -->
      <a :href="websiteAuthorInfo.githubUrl">
        <font-awesome-icon
          :icon="['fab', 'github']"
          class="social-icon"
          id="github"
        />
      </a>

      <!-- QQ -->
      <a :href="websiteAuthorInfo.juejinUrl">
        <i class="juejin"></i>
      </a>

      <!-- 邮箱 -->
      <a :href="'mailto:' + ''">
        <font-awesome-icon
          :icon="['fas', 'envelope']"
          class="social-icon"
          id="email"
        />
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const websiteAuthorInfo = computed(
  () => store.state.websiteAbout.websiteAuthorInfo
);
const blogsCount = computed(() => store.state.blogsAbout.archives.length);
const blogsCategories = computed(
  () => Object.keys(store.state.blogsAbout.categories).length
);
const blogsTags = computed(() => store.state.blogsAbout.tags.length);

const gotoGithub = () => {
  location.href = websiteAuthorInfo.value?.githubUrl;
};
</script>

<style scoped>
@import url(../assets/css/material-icons.css);

.admin-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--card-box-shadow);
  text-align: center;
  height: 375px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.avatar {
  width: 120px;
  height: 120px;
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

.article-info-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0% 8%;
  margin-bottom: 10px;
  margin-top: 0;
}

.article-info {
  margin: 0 5%;
}

.article-info p:nth-child(1) {
  margin-bottom: 0;
}

.article-info p:nth-child(2) {
  margin-top: 5px;
}

.social-icon-container {
  margin-top: 20px;
}

.csdn {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url("../assets/image/csdn.svg");
  background-size: cover;
}

.juejin {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url("../assets/image/juejin.svg");
  background-size: cover;
}

.social-icon {
  margin: 0px 3%;
  font-size: 20px;
  color: #555;
  transition: all 0.3s;
  cursor: pointer;
  transform: translateY(0);
}

.social-icon:hover {
  transform: translateY(-5px);
}

#twitter:hover {
  color: #77ddf6;
}

#github:hover {
  color: black;
}

#qq:hover {
  color: #d43402;
}

#email:hover {
  color: #f7b401;
}

.follow-button {
  display: block;
  margin: 0 auto;
  width: 100%;
}

.github-icon {
  margin-right: 10px;
}

@keyframes floatAni {
}
</style>
