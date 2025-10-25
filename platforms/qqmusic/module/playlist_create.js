//收藏歌单

module.exports = (query, request) => {

  const data = {
    "dirName": query.name
  }

  return request("music.musicasset.PlaylistBaseWrite", "AddPlaylist", data, {
    uin: query.uin,
    qm_keyst: query.qm_keyst
  }).then (res => {
    return {
      id: res.body.result.id,
      playlist: {
        id: res.body.result.id,
        dirId: res.body.result.dirId,
        name: query.name
      }
    }
  })
}