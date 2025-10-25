// QQ音乐歌词获取
const { default: axios } = require('axios')
const getSongDetail = require('./song_detail')  

/**
 * 获取歌词
 * 自动转化 id 为 mid 获取歌词
 */
module.exports = async (query, request) => {
  // 支持 mid 或 id 参数
  const songMid = query.mid ? query.mid : (query.id ? (await getSongDetail({ id: query.id }, request)).songs[0].mid : null)

  if (!songMid) {
    throw new Error('Missing song mid or id') 
  }

  // QQ音乐歌词API
  const url = 'https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?' +
    `songmid=${songMid}&g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8&nobase64=1`

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Referer': 'https://y.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
      }
    })

    const data = response.data

    // 获取原文歌词和翻译歌词
    let lyric = data.lyric || ''
    let tlyric = data.trans || ''

    // 清理翻译歌词中的注释符号
    if (tlyric) {
      tlyric = tlyric.replace(/\/\//g, '')
    }

    // 返回核心字段（按网易云格式对齐）
    return {
      lrc: { version: 0, lyric: lyric || '' },
      tlyric: tlyric ? { version: 0, lyric: tlyric } : null,
      klyric: null,
      romalrc: null
    }

  } catch (error) {
    throw error
  }
}