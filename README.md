<div align="center">

# Multi-Platform Music API

> 🎵 统一的多平台音乐API服务，支持网易云音乐、QQ音乐等平台

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](DOCKER.md)

</div>

---

## ✨ 特性

- 🎯 **统一接口** - 一套API，多个平台，通过参数切换
- 🚀 **高性能** - 智能缓存、并发控制、异步日志
- 🔒 **安全可靠** - 参数验证、错误处理
- 📦 **开箱即用** - Docker部署、环境变量配置、健康检查
- 🎨 **易于扩展** - 模块化设计、工厂模式、适配器模式

---

## 🎼 支持平台

| 平台 | API数量 | 支持功能 |
|------|:-------:|----------|
| 网易云音乐 | 84+ | 搜索、歌曲、专辑、歌手、榜单、歌词、评论、MV、用户等 |
| QQ音乐 | 69+ | 搜索、歌曲、专辑、歌手、榜单、歌词、评论、MV、用户等 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/tlyanyu/multiPlatformMusicApi.git
cd multiPlatformMusicApi

# 2. 安装依赖
npm install

# 3. 启动服务
npm start

# 4. 测试接口
curl "http://localhost:3000/status"
```

### Docker 部署

**快速运行**（使用预构建镜像）：

```bash
# 
docker run -d \
  --name music-api \
  -p 3000:3000 \
  -e CORS_ALLOW_ORIGIN=https://yourdomain.com \
  --restart unless-stopped \
  ghcr.io/tlyanyu/multiplatformmusicapi:latest
```

**使用 Docker Compose**（推荐）：

```bash
# 默认启动（使用预构建镜像，端口 3000）
HOST_PORT=3000 docker compose up -d
```

**本地构建方式**（适用于镜像未发布或需要自定义修改的场景）：

编辑 `docker-compose.yml`，将预构建镜像注释掉，启用本地构建：
```yaml
music-api:
  # image: ghcr.io/tlyanyu/multiplatformmusicapi:latest  # 注释这行
  build:  # 取消这三行注释
    context: .
    dockerfile: Dockerfile
```

然后启动并构建：
```bash
docker compose up -d --build
```

> **注意**：首次本地构建需要 3-5 分钟（下载依赖）

---

## 📖 API 文档

### 接口标准

本项目基于 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 进行自定义及平台扩展。

- **接口文档**: https://neteasecloudmusicapi.js.org/
- **重要**: 所有请求参数需要添加 `platform` 参数（如 `platform=netease` 或 `platform=qqmusic`）

### API 使用示例

```bash
# 搜索歌曲
curl "http://localhost:3000/search?keywords=周杰伦&platform=netease"

# 获取歌曲详情
curl "http://localhost:3000/song/detail?ids=347230&platform=netease"

# 获取榜单
curl "http://localhost:3000/toplist?platform=qqmusic"

# 检查服务状态
curl "http://localhost:3000/status"
```

### 认证说明

部分接口需要登录后才能访问，可以通过Cookie或Query参数传递认证信息：

#### 网易云音乐

```bash
# Cookie 方式
curl -H "Cookie: MUSIC_U=your_music_u_value" \
  "http://localhost:3000/user/detail?platform=netease"

# Query 方式
curl "http://localhost:3000/user/detail?platform=netease&MUSIC_U=your_music_u_value"
```

#### QQ 音乐

```bash
# Cookie 方式
curl -H "Cookie: uin=your_uin; qm_keyst=your_keyst" \
  "http://localhost:3000/user/detail?platform=qqmusic"

# Query 方式
curl "http://localhost:3000/user/detail?platform=qqmusic&uin=your_uin&qm_keyst=your_keyst"
```

---

## ⚙️ 配置

### 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# 服务配置
PORT=3000                # 服务端口
HOST=0.0.0.0            # 监听地址
NODE_ENV=production     # 运行环境

# 日志配置
LOG_LEVEL=info          # 日志级别: debug, info, warn, error

# CORS 配置
CORS_ALLOW_ORIGIN=*     # 允许的源，生产环境建议指定具体域名
```

### 启动选项

```bash
# 默认启动
npm start

# 调试模式（显示详细日志）
npm run debug

# 自定义端口
PORT=8080 npm start

# 自定义日志级别
LOG_LEVEL=debug npm start
```

---

## 🏗️ 技术栈

### 核心技术

- **运行时**: Node.js >= 18.0.0
- **Web 框架**: Express 4.x
- **HTTP 客户端**: Axios, Got
- **测试框架**: Jest, Supertest
- **容器化**: Docker, Docker Compose

### 核心特性

| 特性 | 说明 |
|------|------|
| 智能缓存系统 | LRU 缓存策略，可配置 TTL |
| 并发控制 | 防止系统资源耗尽，默认最大 300 并发 |
| 异步日志 | 减少 I/O 阻塞，支持敏感信息脱敏 |
| 健康检查 | Docker 健康检查，自动监控服务状态 |
| 工厂模式 | 统一平台管理，易于扩展新平台 |
| 适配器模式 | 统一接口标准，屏蔽平台差异 |

---

## 📁 项目结构

```
multiPlatformMusicApi/
├── app.js                 # 应用入口
├── server.js              # HTTP服务器
├── core/                  # 核心模块
│   ├── Logger.js         # 日志系统
│   ├── PlatformCache.js  # 缓存管理
│   ├── ConcurrencyLimiter.js  # 并发控制
│   ├── PlatformConfig.js # 配置管理
│   └── Result.js         # 响应格式化
├── platforms/            # 平台适配器
│   ├── PlatformFactory.js    # 平台工厂
│   ├── base/
│   │   └── BasePlatform.js   # 平台基类
│   ├── netease/          # 网易云音乐
│   │   ├── NeteasePlatform.js
│   │   └── module/       # API模块（84个）
│   └── qqmusic/          # QQ音乐
│       ├── QQMusicPlatform.js
│       └── module/       # API模块（69个）
├── tests/                # 测试文件
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

---

## 🙏 致谢

特此感谢为本项目带来灵感的项目

- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

- [NeteaseCloudMusicApiEnhanced](https://github.com/neteasecloudmusicapienhanced/api-enhanced) 

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## ⚠️ 免责声明

- 本项目仅供学习交流使用，请勿用于商业用途
- 所有音乐版权归原平台所有
- 使用本项目所造成的一切后果由使用者自行承担

---

<div align="center">

### Made with ❤️ by [tlyanyu](https://github.com/tlyanyu)

如果觉得项目不错，请给个 ⭐ **Star** 支持一下！

[GitHub](https://github.com/tlyanyu/multiPlatformMusicApi) • [Issues](https://github.com/tlyanyu/multiPlatformMusicApi/issues) • [文档](https://neteasecloudmusicapi.js.org/)

</div>
