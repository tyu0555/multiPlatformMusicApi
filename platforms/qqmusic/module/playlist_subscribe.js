//收藏歌单

module.exports = (query, request) => {
  const method = query.t == 1 ? 'FavPlaylist' : 'CancelFavPlaylist'

  const data = {
    "uin": query.uin,
    "v_playlistId": query.id.split(',').map(Number).filter(num => !isNaN(num))
  }

  return request("music.musicasset.PlaylistFavWrite", method, data, {
    uin: query.uin,
    qm_keyst: query.qm_keyst
  }) 

}