# 发布到 GitHub Pages

当前 GitHub 插件在本机连接失败，因此本项目已经先整理成本地 Git 仓库和可上传源码。

## 如果已有主页仓库

主页仓库通常叫：

`你的用户名.github.io`

在本目录执行：

```powershell
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git push -u origin main
```

然后打开仓库 Settings -> Pages，选择：

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

## 如果想单独建仓库

建议仓库名：

`must-have-productivity-apps`

创建仓库后执行：

```powershell
git remote add origin https://github.com/你的用户名/must-have-productivity-apps.git
git push -u origin main
```

然后在 Settings -> Pages 中启用 GitHub Pages。

## 可上传压缩包

如果不用命令行，可以把 `ten-app-suite-github-pages.zip` 上传到 GitHub 网页端。
