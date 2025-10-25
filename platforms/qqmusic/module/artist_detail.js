//歌手详情

module.exports = (query, request) => {

  const data = {
      "singer_mids": [
        query.id
      ],
      "pic": 1,
      "group_singer": 1,
      "wiki_singer": 1,
      "ex_singer": 1
  }

  return request("music.musichallSinger.SingerInfoInter", "GetSingerDetail", data, {
    uin: 0,
    qm_keyst: '',
  }).then(res => {
    if(!res.body.singer_list) {
      throw new Error("not found artist")
    }
    return formatFollowSingerList(res.body.singer_list[0])
  })
}

function formatFollowSingerList(data) {
  return {
    data: {
      artist: {
        id: data.basic_info.singer_mid,
        name: data.basic_info.name,
        picUrl: data.pic.pic || "",
        alias: [],
        description: data.ex_info.desc || "",
        musicSize: 0,
        albumSize: 0,
        mvSize: 0,
      },
      platform: "qqmusic"
    }
  }
}