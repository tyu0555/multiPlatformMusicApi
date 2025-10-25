// QQ音乐歌曲详情

module.exports = (query, request) => {
  // 支持单个歌曲ID或多个歌曲ID
  const songIds = query.ids ?
    (Array.isArray(query.ids) ? query.ids : query.ids.split(',').map(id => parseInt(id))) :
    [parseInt(query.id)]

  const data = {
    ids: songIds,
    types: songIds.map(() => 0)  // 0表示歌曲类型
  }

  return request('music.trackInfo.UniformRuleCtrl', 'CgiGetTrackInfo', data, {
    uin: query.uin || 0,
    qm_keyst: query.qm_keyst || ''
  }).then(response => {

    const tracks = response.body.tracks || []

    if (tracks.length === 0) {
      throw new Error('No song data found')
    }

    return formatSongs(tracks)
  }).catch(error => {
    throw error
  })
}

function formatSongs(tracks) {

  return {
    songs: tracks.map(track => ({
      id: track.id,
      mid: track.mid,
      name: track.name || track.title,
      ar: track.singer ? track.singer.map(s => ({
        id: s.mid,
        name: s.name
      })) : [],
      al: {
        id: track.album ? track.album.id : 0,
        name: track.album ? track.album.name : '',
        picUrl: track.album?.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${track.album.mid}.jpg` : ''
      },
      dt: (track.interval || 0) * 1000,
      mv: track.mv?.vid || 0,
      fee: track.pay ? track.pay.pay_play : 0,
      alia: [track.subtitle],
      platform: 'qqmusic'
    })),
    count: tracks.length
  }
}