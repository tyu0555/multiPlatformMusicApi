/**
 * 多平台音乐API服务启动器
 */
const WelcomePage = require('./core/WelcomePage')

async function start() {
  try {
    WelcomePage.clear()
    WelcomePage.showBanner()
    WelcomePage.showStartupStatus()

    const { MultiPlatformServer } = require('./server')
    const server = new MultiPlatformServer()

    const app = await server.start({
      port: process.env.PORT || 3000,
      host: process.env.HOST || ''
    })

    // 从已启动的server获取状态信息
    const serverInfo = buildServerInfo(app, {
      port: process.env.PORT || 3000,
      host: process.env.HOST || ''
    })

    // 显示平台状态 - 遍历所有平台
    serverInfo.platforms.forEach(platform => {
      WelcomePage.showPlatformStatus(platform.name, platform.modules, platform.deviceId || 'N/A', platform.staticIP, platform.defaultUid)
    })

    WelcomePage.showReadyStatus(serverInfo)

    const gracefulShutdown = (signal) => {
      const { red, bright, reset } = WelcomePage.colors
      console.log(`\n${red}${bright}🛑 ${signal} received, shutting down gracefully...${reset}`)

      if (app?.server) {
        app.server.close(() => {
          console.log(`${red}👋 Server closed${reset}`)
          process.exit(0)
        })
      } else {
        process.exit(0)
      }
    }

    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  } catch (error) {
    WelcomePage.showError('Server startup failed', error)
    process.exit(1)
  }
}

/**
 * 构建服务器信息
 */
function buildServerInfo(app, options) {
  const serverInfo = {
    host: options.host || 'localhost',
    port: options.port,
    platforms: []
  }

  // 获取平台信息
  if (app.platformFactory) {
    const availablePlatforms = app.platformFactory.getAvailablePlatforms()

    serverInfo.platforms = availablePlatforms.map(name => {
      const platform = app.platformFactory.getPlatform(name)

      // 获取平台特定信息
      const platformInfo = {
        name: name,
        modules: platform.modules ? platform.modules.size : 0,
        status: 'ready'
      }

      if (platform.staticDeviceId) {
        platformInfo.deviceId = platform.staticDeviceId
      } else if (platform.deviceId) {
        platformInfo.deviceId = platform.deviceId
      }

      if (platform.staticCnIP) {
        platformInfo.staticIP = platform.staticCnIP
      }

      if (platform.defaultUid) {
        platformInfo.defaultUid = platform.defaultUid
      }

      return platformInfo
    })
  }

  return serverInfo
}

if (require.main === module) {
  start()
}

module.exports = { start }