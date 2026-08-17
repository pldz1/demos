#!/usr/bin/env bash

set -u

shopt -s nullglob

configs=(./*/.git/config)

# ==============================
# 清理备份
# ==============================
if [[ "${1:-}" == "clean" ]]; then
    backups=(./*/.git/config.bak)

    if [[ ${#backups[@]} -eq 0 ]]; then
        echo "没有找到 .git/config.bak"
        exit 0
    fi

    echo "发现以下备份文件："
    echo

    for backup in "${backups[@]}"; do
        echo "  $backup"
    done

    echo
    read -r -p "确定删除这些备份吗？[y/N]: " confirm

    case "$confirm" in
        y|Y|yes|YES)
            for backup in "${backups[@]}"; do
                rm -f "$backup"
                echo "删除: $backup"
            done

            echo
            echo "备份清理完成。"
            ;;
        *)
            echo "已取消。"
            ;;
    esac

    exit 0
fi

# ==============================
# 查找仓库
# ==============================
if [[ ${#configs[@]} -eq 0 ]]; then
    echo "没有找到第一层目录中的 .git/config"
    exit 0
fi

echo "正在扫描 GitHub remote 用户名..."
echo

remote_users=()

for config in "${configs[@]}"; do
    [[ -f "$config" ]] || continue

    while IFS= read -r remote_user; do
        [[ -n "$remote_user" ]] && remote_users+=("$remote_user")
    done < <(
        grep -oE '[^/@[:space:]]+@github\.com/' "$config" 2>/dev/null \
        | sed -E 's#([^/@[:space:]]+)@github\.com/#\1#'
    )
done

# ==============================
# Remote 用户名去重
# ==============================
if [[ ${#remote_users[@]} -gt 0 ]]; then
    mapfile -t unique_remote_users < <(
        printf '%s\n' "${remote_users[@]}" | sort -u
    )
else
    unique_remote_users=()
fi

if [[ ${#unique_remote_users[@]} -eq 0 ]]; then
    echo "没有找到 GitHub remote。"
    echo
    echo "例如："
    echo "  https://old-user@github.com/owner/repo.git"
    echo
    echo "没有进行任何修改。"
    exit 0
fi

# ==============================
# 显示当前 remote 用户名
# ==============================
echo "发现以下 GitHub remote 用户名："
echo

for remote_user in "${unique_remote_users[@]}"; do
    echo "  $remote_user"
done

echo
echo "涉及配置："

for config in "${configs[@]}"; do
    if grep -qE '[^/@[:space:]]+@github\.com/' "$config" 2>/dev/null; then
        echo "  $config"
    fi
done

# ==============================
# 输入新的 remote 用户名
# ==============================
echo
read -r -p "请输入新的 GitHub remote 用户名: " NEW_REMOTE_USER

if [[ -z "$NEW_REMOTE_USER" ]]; then
    echo "新的 remote 用户名不能为空。"
    exit 1
fi

# 简单防止输入 user/repo 之类的内容
if [[ "$NEW_REMOTE_USER" == *"/"* || "$NEW_REMOTE_USER" == *" "* || "$NEW_REMOTE_USER" == *"@"* ]]; then
    echo "remote 用户名格式不正确：$NEW_REMOTE_USER"
    exit 1
fi

echo

# ==============================
# 修改
# ==============================
for config in "${configs[@]}"; do
    [[ -f "$config" ]] || continue

    mapfile -t file_remote_users < <(
        grep -oE '[^/@[:space:]]+@github\.com/' "$config" 2>/dev/null \
        | sed -E 's#([^/@[:space:]]+)@github\.com/#\1#' \
        | sort -u
    )

    if [[ ${#file_remote_users[@]} -eq 0 ]]; then
        continue
    fi

    echo "修改: $config"

    for remote_user in "${file_remote_users[@]}"; do
        echo "  $remote_user -> $NEW_REMOTE_USER"
    done

    # 只在不存在备份时创建，避免覆盖最初的 config
    if [[ ! -f "${config}.bak" ]]; then
        cp "$config" "${config}.bak"
        echo "  备份: ${config}.bak"
    else
        echo "  备份已存在，跳过备份"
    fi

    # 只修改 @github.com/ 前的 remote 用户名，保留 owner/repository 不变
    # gitee.com / gitlab.com 等均不会受到影响
    NEW_REMOTE_USER="$NEW_REMOTE_USER" perl -pi -e '
        s#[^/@\s]+\@github\.com/#$ENV{NEW_REMOTE_USER}\@github.com/#g
    ' "$config"

    echo
done

echo "完成。"
echo
echo "如确认修改无误，可运行："
echo "  $0 clean"
echo
echo "删除所有 .git/config.bak"
