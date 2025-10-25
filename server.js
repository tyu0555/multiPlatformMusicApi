const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')

// 导入核心模块
const Result = require('./core/Result')
const Logger = require('./core/Logger')
const { globalLimiter } = require('./core/ConcurrencyLimiter')

// 导入平台工厂和适配器
const platformFactory = require('./platforms/PlatformFactory')
const NeteasePlatform = require('./platforms/netease/NeteasePlatform')
const QQMusicPlatform = require('./platforms/qqmusic/QQMusicPlatform')

/**
 * 多平台音乐API服务器
 * 支持网易云音乐、QQ音乐等多个平台
 */
class MultiPlatformServer {
  constructor() {
    this.app = null
    this.initialized = false
    this.logger = new Logger({ component: 'server' })
  }

  /**
   * 初始化服务器
   */
  async initialize() {
    if (this.initialized) {
      return this.app
    }

    // 注册平台适配器
    await this.registerPlatforms()

    // 创建Express应用
    this.app = express()
    this.setupMiddleware()
    await this.setupRoutes()

    this.initialized = true
    this.logger.compact('info', 'Multi-platform music server initialized', 'debug')
    return this.app
  }

  /**
   * 注册平台适配器
   */
  async registerPlatforms() {
    try {
      this.logger.compact('platform', 'Registering platform adapters...', 'debug')

      // 注册网易云音乐平台
      platformFactory.register('netease', NeteasePlatform, {
        name: 'netease'
      })

      // 注册QQ音乐平台
      platformFactory.register('qqmusic', QQMusicPlatform, {
        name: 'qqmusic'
      })

      // 初始化所有平台
      await platformFactory.initialize()

      const platformCount = platformFactory.getAvailablePlatforms().length
      this.logger.compact('platform', `Platform registration completed (${platformCount} platforms loaded)`, 'debug')

      return true
    } catch (error) {
      this.logger.error('Platform registration failed', error)
      throw error
    }
  }

  /**
   * 设置中间件
   */
  setupMiddleware() {
    const { CORS_ALLOW_ORIGIN } = process.env

    // 信任代理
    this.app.set('trust proxy', true)

    // Cookie 解析中间件
    this.app.use(cookieParser())

    // 静态文件服务
    this.app.use(express.static(path.join(__dirname, 'public')))

    this.app.use((req, res, next) => {
      if (req.path !== '/' && !req.path.includes('.')) {
        res.set({
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': CORS_ALLOW_ORIGIN || req.headers.origin || '*',
          'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
          'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
          'Content-Type': 'application/json; charset=utf-8',
        })
      }
      req.method === 'OPTIONS' ? res.status(204).end() : next()
    })

    // JSON解析中间件
    this.app.use(express.json({ limit: '5mb' }))
    this.app.use(express.urlencoded({ extended: false, limit: '5mb' }))

  }

  /**
   * 设置路由
   */
  async setupRoutes() {
    // 健康检查/状态接口
    this.app.get('/status', (req, res) => {
      const platforms = platformFactory.getAvailablePlatforms()
      const limiterStatus = globalLimiter.getStatus()

      res.json(Result.success({
        status: 'online',
        platforms: platforms,
        concurrency: {
          active: limiterStatus.activeCount,
          queued: limiterStatus.queueLength,
          available: limiterStatus.availableSlots,
          stats: limiterStatus.stats
        },
        timestamp: Date.now()
      }))
    })

    const resourceRoutes = platformFactory.getAvailableRoutes()

    // 为每个资源路由注册处理器（使用 all 进行精确匹配，避免前缀匹配问题）
    resourceRoutes.forEach(route => {
      this.app.all(`/${route}`, async (req, res) => {
        await this.handleResourceAPI(req, res, route)
      })
    })

    // 错误处理
    this.app.use((_, res) => {
      res.status(404).json(Result.error('API endpoint not found', 404))
    })

    // 全局错误处理中间件
    this.app.use((error, req, res, next) => {
      this.logger.error('Unhandled error', error, { url: req.url })
      res.status(500).json(Result.error('Internal server error', 500))
    })
  }

  /**
   * 处理通用API调用
   */
  async handleResourceAPI(req, res, route) {
    const startTime = Date.now()

    try {
      // 将 Cookie 中的认证参数注入到 query 中（优先使用 Cookie）
      if (req.cookies) {
        if (req.cookies.MUSIC_U && !req.query.MUSIC_U) {
          req.query.MUSIC_U = req.cookies.MUSIC_U
        }
        if (req.cookies.uin && !req.query.uin) {
          req.query.uin = req.cookies.uin
        }
        if (req.cookies.qm_keyst && !req.query.qm_keyst) {
          req.query.qm_keyst = req.cookies.qm_keyst
        }
      }

      const platformName = req.query.platform || req.body?.platform || 'netease'

      // 获取平台实例并调用模块 - 参数处理移到平台内部
      const platform = platformFactory.getPlatform(platformName)
      const result = await platform.callModule(route, req)

      // 返回结果
      res.status(result.code).json(result)

    } catch (error) {
      const responseTime = Date.now() - startTime

      this.logger.error('API request failed', error, {
        route: route,
        platform: req.query.platform || req.body?.platform || 'unknown',
        responseTime: responseTime
      })

      const errorResult = Result.error(error, 500)

      res.status(errorResult.code).json(errorResult)
    }
  }

  /**
   * 启动服务器
   */
  async start(options = {}) {
    const port = Number(options.port || process.env.PORT || '3000')
    const host = options.host || process.env.HOST || ''

    try {
      this.logger.compact('info', 'Starting Multi-Platform Music Server...', 'debug')

      // 初始化服务器（如果尚未初始化）
      if (!this.initialized) {
        await this.registerPlatforms()
        this.app = express()
        this.setupMiddleware()
        await this.setupRoutes()
        this.initialized = true
      }

      // 启动HTTP服务器
      const server = await new Promise((resolve, reject) => {
        const serverInstance = this.app.listen(port, host, () => {
          resolve(serverInstance)
        }).on('error', reject)
      })

      // 扩展app对象
      this.app.server = server
      this.app.platformFactory = platformFactory

      return this.app

    } catch (error) {
      this.logger.error('Server startup failed', error)
      throw error
    }
  }


  /**
   * 停止服务器
   */
  stop() {
    if (this.app && this.app.server) {
      this.app.server.close()
      this.logger.info('Server stopped')
    }
  }
}

module.exports = {
  MultiPlatformServer,
  platformFactory
}