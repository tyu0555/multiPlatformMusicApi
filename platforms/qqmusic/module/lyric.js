/**
 * 获取歌词（含翻译和罗马音）
 * @param {Object} query
 * @param {string|number} query.id - 歌曲id
 * @param {Function} request - 请求函数
 * @returns {Promise<Object>} 歌词对象，包含 lrc, tlyric, klyric, romalrc 字段
 */

module.exports = (query, request) => {
  if (!query.id) {
    throw new Error('Song id is required')
  }

  const data = {
    "crypt" : 0,
    "roma" : 1,
    "roma_t" : 0,
    "songID" : Number(query.id) || 0,
    "trans" : 1,
    "trans_t" : 0,
    "type" : 0
  }

  return request("music.musichallSong.PlayLyricInfo", "GetPlayLyricInfo", data, {
    uin: 0,
    qm_keyst: ''
  })
}