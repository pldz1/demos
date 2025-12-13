<template>
  <!-- 页头 -->
  <HeaderBar></HeaderBar>
  <!-- 主体内容 -->
  <div class="archive-list">
    <div class="container">
      <!-- 侧边栏 -->

      <div class="side-content">
        <SideBarCategory></SideBarCategory>
        <SideBarTag></SideBarTag>
      </div>

      <!-- 归档 -->
      <div class="archive-body">
        <div class="archive-card">
          <el-timeline class="timeline">
            <el-timeline-item
              center
              :timestamp="`历史文章 - ${articleCount}`"
              placement="top"
              class="root-item"
            >
            </el-timeline-item>

            <el-timeline-item
              v-for="archive in archivesList"
              :key="archive.id"
              class="year-item"
              :timestamp="archive.date + ''"
              placement="top"
            >
              <div class="article-item">
                <router-link
                  :to="`/article/${archive.id}`"
                  class="article-thumbail-link"
                  ><img
                    :src="archive.thumbnail"
                    @error.once=""
                    alt="缩略图"
                    class="article-thumbnail"
                  />
                </router-link>

                <div class="article-info">
                  <router-link
                    :to="`/article/${archive.id}`"
                    class="article-title"
                    >{{ archive.title }}
                  </router-link>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 分页 -->
        <el-pagination
          background
          layout="prev, pager, next"
          :total="articleCount"
          :page-size="pageSize"
          id="pagination"
          @current-change="onCurrentPageChanged"
          v-if="articleCount > 0"
        />
      </div>
    </div>

    <!-- 页脚 -->
    <FootBar></FootBar>

    <!-- 回到顶部 -->
    <BackToTop :cls="'archive-list'"></BackToTop>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, ref, onMounted, watch } from "vue";

import HeaderBar from "../../components/HeaderBar.vue";
import SideBarCategory from "../../components/SideBarCategory.vue";
import SideBarTag from "../../components/SideBarTag.vue";
import FootBar from "../../components/FootBar.vue";
import BackToTop from "../../components/BackToTop.vue";

const store = useStore();
const pageSize = ref(10);
const pageNum = ref(1);

const archives = computed(() => {
  return store.state.blogsAbout.archives.sort((a, b) => {
    // 将字符串转为 Date 对象
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    // 按时间从大到小排序
    return dateB - dateA;
  });
});
const articleCount = computed(() => store.state.blogsAbout.archives.length);
const archivesList = ref([]);
const onCurrentPageChanged = (value) => {
  pageNum.value = value;
};

watch(
  () => pageNum.value,
  () => {
    const startIndex = (pageNum.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    archivesList.value = archives.value.slice(startIndex, endIndex);
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.archive-list {
  height: 100%;
  width: 100%;
  overflow-y: auto;
}

.container {
  padding: 40px 15px;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  animation: fadeInUp 1s;
  min-height: 600px;
}

.side-content {
  width: 26%;
  margin-right: 20px;
}

.archive-body {
  width: 74%;
  height: 100%;

  .archive-card {
    background: white;
    border-radius: 8px;
    box-shadow: var(--card-box-shadow);
    padding: 50px 24px;
  }

  :deep(#pagination) {
    margin-top: 20px;
    justify-content: center;

    & > button {
      box-shadow: var(--card-box-shadow);
      background: white;
      border-radius: 8px;
      height: 35px;
      width: 35px;
    }

    li {
      box-shadow: var(--card-box-shadow);
      background-color: white;
      border-radius: 8px;
      margin: 0 6px;
      height: 35px;
      width: 35px;
    }

    li.active {
      color: white;
      background: var(--theme-color);
      font-weight: normal;
    }
  }
}

:deep(.timeline) {
  margin-top: 20px;

  .root-item {
    .el-timeline-item {
      padding-bottom: 20px;
    }

    .el-timeline-item__node {
      border: 5px solid var(--theme-color);
      background: transparent;
      width: 20px;
      height: 20px;
      left: -5px;
      top: -7px;
    }

    .el-timeline-item__tail {
      top: calc(50% - 15px);
      height: calc(50% + 15px);
      border-left: 2px solid #4ba9fc;
    }

    .el-timeline-item__wrapper {
      transform: translateY(-11px);

      .el-timeline-item__timestamp {
        font-size: 24px;
        color: var(--text-color);
      }
    }
  }

  .year-item {
    .el-timeline-item__node {
      border: 3px solid #ff7242;
      background: white;
      width: 12px;
      height: 12px;
      left: -1px;
      top: 0;
    }

    .el-timeline-item__wrapper {
      transform: translateY(-6px);

      .el-timeline-item__timestamp {
        font-size: 20px;
        color: var(--text-color);
      }
    }

    .el-timeline-item__tail {
      border-left: 2px solid #9eccf5;
    }
  }

  .year-item:nth-last-child(2) {
    padding-bottom: 0;
  }

  .year-item:last-child {
    visibility: hidden;
  }
}

.article-item {
  display: flex;
  justify-content: center;
  align-content: center;
  padding: 10px 0;

  .article-thumbail-link {
    height: 80px;
    width: 80px;
    overflow: hidden;
    border-radius: 6px;

    .article-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: all 0.4s ease;
    }
  }

  .article-thumbnail:hover {
    transform: scale(1.1);
  }

  .article-info {
    flex: 1;
    padding-left: 16px;
    word-break: break-all;
    display: inline-block;
    align-self: center;

    .article-title {
      color: var(--text-color);
      font-size: 15px;
      text-decoration: none;
      transition: color 0.4s;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      line-height: 1.5;
      -webkit-line-clamp: 2;

      &:hover {
        color: var(--theme-color);
      }
    }

    .article-meta-data {
      font-size: 13px;
      color: rgb(133, 133, 133);
      box-sizing: border-box;
      line-height: 30px;
      overflow: hidden;
      -webkit-line-clamp: 1;
      display: -webkit-box;
      -webkit-box-orient: vertical;

      .article-meta-data-icon {
        margin-right: 5px;
      }

      span {
        margin-right: 20px;
      }
    }
  }
}

@media screen and (max-width: 900px) {
  .archive-body {
    width: 100%;
  }
}
</style>
