# 🔔 \_blogs Folder

## 0️⃣ CN 说明

- 这个 `_blog` 文件夹存放博客的 markdown 源文件

- 类似于 `_blog/xx.md` 这种单独的 markdown 不会认为是有效的 markdown 笔记, 应该给它创建一个文件夹，这个文件夹名字就是它的 `category`

### 📋 Markdown 参数说明

每篇博客的 Markdown 文件需要包含以下基本参数：

| 参数名      | 说明                 | 示例                      |
| ----------- | -------------------- | ------------------------- |
| `title`     | 博客名字             | `1 Docker 基本指令`       |
| `category`  | 博客分类             | `Docker`                  |
| `serialNo`  | 博客序号             | `1`                       |
| `tags`      | 博客标签             | `[Docker, 学习笔记]`      |
| `date`      | 博客时间（`/` 格式） | `2025/1/1`                |
| `thumbnail` | 缩略图位置           | `./default_thumbnail.png` |
| `summary`   | 摘要                 | `无`                      |

### ✍️ 示例 Markdown 文件

以下是一个完整的 Markdown 文件示例：

```markdown
---
title: 1 Docker 基本指令
category: Docker
serialNo: 1
tags: [Docker, 学习笔记]
date: 2025/1/1
thumbnail: ./default_thumbnail.png
summary: 无
---

# 1.1 安装 docker

# 1.2 docker 安装并配置 ubuntu20

1. 拉取 docker 镜像：`sudo docker pull ubuntu:20.04`

2. 启动镜像： `docker run --rm -it --network=host ubuntu:20.04`
```

## 1️⃣ EN Explanation

- The `_blog` folder contains the markdown source files for the blog.

- Individual markdown files like `_blog/xx.md` should not be considered as valid markdown posts. You should create a folder for each post, and the folder name should be the `category` of the blog.

### 📋 Markdown Parameters Explanation

Each blog's markdown file needs to include the following basic parameters:

| Parameter   | Description            | Example                   |
| ----------- | ---------------------- | ------------------------- |
| `title`     | Blog title             | `1 Basic Docker Commands` |
| `category`  | Blog category          | `Docker`                  |
| `serialNo`  | Blog serial number     | `1`                       |
| `tags`      | Blog tags              | `[Docker, Study Notes]`   |
| `date`      | Blog date (`/` format) | `2025/1/1`                |
| `thumbnail` | Thumbnail location     | `./default_thumbnail.png` |
| `summary`   | Blog summary           | `None`                    |

### ✍️ Example Markdown File

Here is a complete example of a markdown file:

```markdown
---
title: 1 Basic Docker Commands
category: Docker
serialNo: 1
tags: [Docker, Study Notes]
date: 2025/1/1
thumbnail: ./default_thumbnail.png
summary: None
---

# 1.1 Install Docker

# 1.2 Install and Configure Docker on Ubuntu 20

1. Pull the Docker image: `sudo docker pull ubuntu:20.04`

2. Start the image: `docker run --rm -it --network=host ubuntu:20.04`
```
