<template>
  <div class="catalog-card" v-if="Object.keys(titles).length > 0">
    <div class="catalog-card-header">
      <div>
        <span>目录</span>
      </div>
      <span class="progress">{{ progress }}</span>
    </div>

    <div class="catalog-content">
      <div
        v-for="title in titles"
        :key="title.id"
        @click="scrollToView(title.scrollTop)"
        :class="[
          'catalog-item',
          currentTitle.id == title.id ? 'active' : 'not-active',
        ]"
        :style="{ marginLeft: title.level * 20 + 'px' }"
        v-show="title.isVisible"
        :title="title.rawName"
      >
        {{ title.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";

// 定义组件的 props
const props = defineProps({
  container: {
    type: String,
    default: ".post-body .blog-content", // 默认选择器
  },
});

// 定义响应式数据
const currentTitle = reactive({}); // 当前选中的标题
const progress = ref(0); // 滚动进度
const titles = ref([]); // 目录标题列表
const scrollElem = ref(null); // 滚动的元素

// 获取目录标题的方法
const getTitles = () => {
  const titles = []; // 存储标题的数组
  let levels = ["h1", "h2", "h3"]; // 支持的标题级别

  // 查找文章容器
  const blogElement = document.querySelector(props.container);
  if (!blogElement) {
    return titles; // 如果找不到容器，返回空数组
  }

  // 获取所有元素
  const elements = Array.from(blogElement.querySelectorAll("*"));

  // 调整标签级别，仅保留实际存在的标题标签
  const tagNames = new Set(elements.map((el) => el.tagName.toLowerCase()));
  levels = levels.filter((level) => tagNames.has(level));

  const serialNumbers = levels.map(() => 0); // 初始化序号数组

  // 遍历元素，构建标题树
  elements.forEach((element, i) => {
    const tagName = element.tagName.toLowerCase();
    const level = levels.indexOf(tagName);
    if (level === -1) return; // 跳过非标题标签

    // 构造标题节点
    const id = `${tagName}-${element.innerText}-${i}`;
    const node = {
      id,
      level,
      parent: null,
      children: [],
      rawName: element.innerText,
      scrollTop: element.offsetTop,
      isVisible: false, // 默认不可见
    };

    // 确定节点的父子关系
    if (titles.length > 0) {
      const lastNode = titles.at(-1);

      if (lastNode.level < node.level) {
        // 当前节点是子标题
        node.parent = lastNode;
        lastNode.children.push(node);
      } else if (lastNode.level > node.level) {
        // 当前节点是更高级的标题
        serialNumbers.fill(0, level + 1);
        let parent = lastNode.parent;
        while (parent) {
          if (parent.level < node.level) {
            node.parent = parent;
            parent.children.push(node);
            break;
          }
          parent = parent.parent;
        }
      } else if (lastNode.parent) {
        // 当前节点是平级标题
        node.parent = lastNode.parent;
        lastNode.parent.children.push(node);
      }
    }

    // 更新序号并设置节点名称
    serialNumbers[level] += 1;
    const serialNumber = serialNumbers.slice(0, level + 1).join(".");
    node.name = `${serialNumber}. ${element.innerText}`;
    node.isVisible = node.parent == null; // 根节点默认可见

    titles.push(node);
  });

  return titles;
};

// 监听滚动事件，更新标题和滚动进度
const handleScroll = () => {
  // 获取容器的滚动高度和滚动偏移
  const scrollTop = scrollElem.value.scrollTop; // 当前滚动位置
  const scrollHeight = scrollElem.value.scrollHeight; // 内容总高度
  const clientHeight = scrollElem.value.clientHeight; // 可见区域高度

  // 计算滚动进度百分比
  progress.value = `${parseInt(
    (scrollTop / (scrollHeight - clientHeight)) * 100
  )}%`;

  const visibleTitles = [];

  // 遍历标题，找到当前滚动位置对应的标题
  for (let i = titles.value.length - 1; i >= 0; i--) {
    const title = titles.value[i];
    if (title.scrollTop <= scrollTop) {
      if (currentTitle.id === title.id) return; // 如果当前标题未变，直接返回

      Object.assign(currentTitle, title); // 更新当前标题

      // 展开当前节点和其父节点
      setChildrenVisible(title, true);
      visibleTitles.push(title);

      let parent = title.parent;
      while (parent) {
        setChildrenVisible(parent, true);
        visibleTitles.push(parent);
        parent = parent.parent;
      }

      // 折叠其他节点
      titles.value.forEach((t) => {
        if (!visibleTitles.includes(t)) {
          setChildrenVisible(t, false);
        }
      });

      return;
    }
  }
};

// 设置子节点的可见性
const setChildrenVisible = (title, isVisible) => {
  title.children.forEach((child) => {
    child.isVisible = isVisible;
  });
};

// 滚动到指定的位置
const scrollToView = (scrollTop) => {
  if (scrollElem.value)
    scrollElem.value.scrollTo({ top: scrollTop, behavior: "smooth" });
};

// 组件挂载时初始化标题
onMounted(() => {
  titles.value = getTitles();
  const el = document.querySelector(".blog-details");
  if (el) {
    scrollElem.value = el;
    scrollElem.value.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  if (scrollElem.value) {
    scrollElem.value.removeEventListener("scroll", handleScroll);
    scrollElem.value = null;
  }
});
</script>

<style scoped>
.catalog-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--card-box-shadow);
  padding: 20px 24px;
  width: 100%;
  margin-top: 25px;
  box-sizing: border-box;
  max-height: 300px;
}

.catalog-card-header {
  text-align: left !important;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.catalog-icon {
  font-size: 18px;
  margin-right: 10px;
  color: dodgerblue;
}

.catalog-card-header div > span {
  font-size: 17px;
  color: var(--text-color);
}

.progress {
  color: #a9a9a9;
  font-style: italic;
  font-size: 140%;
}

.catalog-content {
  max-height: 230px;
  overflow: auto;
  margin-right: -24px;
  padding-right: 20px;
}

.catalog-item {
  color: #666261;
  margin: 5px 0;
  line-height: 28px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  padding: 2px 6px;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;

  &:hover {
    color: var(--theme-color);
  }
}

.active {
  background-color: var(--theme-color);
  color: white;

  &:hover {
    background-color: #0c82e9;
    color: white;
  }
}
</style>
