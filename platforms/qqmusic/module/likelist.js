module.exports = async (query, request) => {
  const data = {
    "uin": query.uin || ''
  }
  const response = await request("music.musicasset.PlaylistFavRead", "GetPlaylistFavInfo", data, {
    uin: query.uin,
    qm_keyst: query.qm_keyst
  })
  
  // 提取所有歌单的ID
  const ids = response.body.v_list.map(playlist => Number(playlist.tid))
  
  return {
    ids: ids
  }
}
