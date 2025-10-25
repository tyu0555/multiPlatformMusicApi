// 取消收藏歌单

module.exports = async (query, request) => {
  const data = {
    id: query.id
  }
  return request(`/api/playlist/unsubscribe`, data, {
    crypto: "eapi",
    useCheckToken: false,
    MUSIC_U: query.MUSIC_U
  }).then(res => {
    return res.body
  })
}