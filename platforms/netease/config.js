/**
 * 网易云音乐平台特定配置
 */

/**
 * 资源类型评论映射
 */
const RESOURCE_TYPE_MAP = {
  "0": "R_SO_4_",
  "1": "R_MV_5_",
  "2": "A_PL_0_",
  "3": "R_AL_3_",
  "4": "A_DJ_1_",
  "5": "R_VI_62_",
  "6": "A_EV_2_",
  "7": "A_DR_14_"
}

/**
 * 应用核心配置
 */
const APP_CONF = {
  apiDomain: "https://interface.music.163.com",
  domain: "https://music.163.com",
  encrypt: true,
  encryptResponse: false
}

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  enableCache: true,
  defaultTTL: 600000, // 10分钟
}

/**
 * API配置
 */
const API_CONFIG = {
  timeout: 10000, // 10秒超时
  retryCount: 3,
  retryDelay: 1000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

/**
 * 平台特定验证规则
 */
const PLATFORM_VALIDATION_RULES = {
  'search': {
    keywords: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'keywords is required and must be 1-100 characters'
    },
    type: {
      type: 'integer',
      default: 1,
      enum: [1, 10, 100, 1000, 1002, 1004, 1006, 1009, 1014, 2000],
      message: 'Invalid search type'
    }
  }
}

/**
 * 网易云平台路由特定缓存配置
 * 覆盖默认缓存配置
 * 使用 ttlMinutes（分钟）更易于配置，会自动转换为毫秒
 */
const ROUTE_CACHE_CONFIGS = {

}

/**
 * 获取资源类型映射
 */
function getResourceTypeMap() {
  return { ...RESOURCE_TYPE_MAP }
}

/**
 * 获取应用核心配置
 */
function getAppConf() {
  return { ...APP_CONF }
}

/**
 * 获取缓存配置
 */
function getCacheConfig() {
  return { ...CACHE_CONFIG }
}

/**
 * 获取API配置
 */
function getApiConfig() {
  return { ...API_CONFIG }
}

/**
 * 获取平台验证规则
 */
function getPlatformValidationRules() {
  return { ...PLATFORM_VALIDATION_RULES }
}

/**
 * 获取路由特定缓存配置
 */
function getRouteCacheConfigs() {
  return { ...ROUTE_CACHE_CONFIGS }
}

module.exports = {
  getResourceTypeMap,
  getAppConf,
  getCacheConfig,
  getApiConfig,
  getPlatformValidationRules,
  getRouteCacheConfigs
}