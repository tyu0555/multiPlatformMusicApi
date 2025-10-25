//私人FM

module.exports = (query, request) => {

  const data = {
    "id": 99,  //猜你喜欢
    "firstplay": 0,
    "num": 3
  }

  if ( !query.uin || !query.qm_keyst) {
    throw new Error('Auth is required')
  }

  return request("music.radioProxy.MbTrackRadioSvr", "get_radio_track", data, {
    uin: query.uin,
    qm_keyst: query.qm_keyst
  }).then(res => {
    return formatpersonalFm(res.body)
  })
}

function formatpersonalFm(data) {
  return {
    data: (data.tracks || []).map((song, index) => ({
      id: song.id,
      mid: song.mid,               
      name: song.name || song.title,
      ar: song.singer ? song.singer.map(s => ({
        id: s.mid,
        name: s.name
      })) : [],
      al: {
        id: song.album ? song.album.id : 0,
        mid: song.album ? song.album.mid : '',
        name: song.album ? song.album.name : '',
        picUrl: song.album?.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg` : ''
      },
      dt: (song.interval || 0) * 1000,
      mv: song.mv?.vid || '',
      fee: song.pay ? song.pay.pay_play : 0,
      alia: [song.subtitle || ''],
      reason: data.extras?.[index]?.rectag?.RecReasonTemplate || '',  
      platform: "qqmusic"
    }))
  }
}