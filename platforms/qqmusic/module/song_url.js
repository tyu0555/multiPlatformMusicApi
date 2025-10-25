const { zzcSign } = require('../util/crypto')
const { default: axios } = require('axios')
const { getQualityMap,getQQConf } = require('../config')
const getSongDetail = require('./song_detail')

/**
 * QQ音乐歌曲URL获取，支持id或mid参数
 */
module.exports = async (query, request) => {
  const songMid = query.mid? query.mid : (query.id ? (await getSongDetail({ id: query.id }, request)).songs[0].mid : null)

  if (!songMid) {
    throw new Error('Missing song mid or id')
  }
  const uin = process.env.DEFAULT_UIN || query.uin || '0' // QQ音乐用户uin
  const qm_keyst = process.env.DEFAULT_QM_KEYST || query.qm_keyst || '' // QQ音乐VIP认证信息
  const quality = query.level || 'exhigh'

  const qualityMap = getQualityMap()
  const qualityConfig = qualityMap[quality]
  
  if (!qualityConfig) {
    throw new Error(`Unsupported quality: ${query.level}`)
  }

  // 构建文件名: prefix + songmid + songmid + suffix
  const filename = `${qualityConfig.prefix}${songMid}${songMid}${qualityConfig.suffix}`

  // 构建请求数据 - 使用传入的uin
  const requestData = {
    comm: {
      uin,
      format: 'json',
      ct: 24,
      cv: 0
    },
    req_1: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        filename: [filename],
        guid: '10000',
        songmid: [songMid],
        songtype: [0],
        uin,
        loginflag: 1,
        platform: '20'
      }
    },
    loginUin: uin
  }

  // 生成签名
  const jsonData = JSON.stringify(requestData)
  const signature = zzcSign(jsonData)
  const timestamp = Date.now()
  const url = `https://u6.y.qq.com/cgi-bin/musics.fcg?_=${timestamp}&sign=${signature}`

  // 构建请求头
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    'Referer': 'https://y.qq.com/'
  }

  // 如果有VIP认证信息，添加Cookie
  if (uin !== '0' && qm_keyst !== '') {
    headers['Cookie'] = `uin=${uin}; qm_keyst=${qm_keyst}`
  }

  try {
    const response = await axios.post(url, jsonData, {
      timeout: 10000,
      headers
    })

    const purl = response.data.req_1.data.midurlinfo?.[0].purl

    const streamDomain = getQQConf().streamDomain

    // 构建最终URL
    const finalUrl = streamDomain + purl

    return {
      data: [{
        id: query.id,   
        mid: songMid,
        url: finalUrl,
        br: qualityConfig.bitrate,
        size: 0, // 未提供文件大小
        md5: '',
        type: qualityConfig.format,
        encodeType: qualityConfig.format,
        level: quality,
        time: 0,
        fee: 0
      }]
    }

  } catch (error) {
    throw new Error(`Failed to get song URL: ${error.message}`)
  }
}

