//QQ音乐搜索接口，不用登录，limit不要太大，否则会返回空结果！！！
const { default: axios } = require('axios')

module.exports = (query, request) => {
  
  //const limit = parseInt(query.limit) || 30
  const limit = Math.min(parseInt(query.limit) || 30, 30) // 限制最大值为30，避免返回空结果
  const offset = parseInt(query.offset) || 0
  const pageNum = Math.floor(offset / limit) + 1

  // 以网易云标准类型对齐：1=单曲,10=专辑,100=歌手,1000=歌单
  const stdType = parseInt(query.type) || 1
  const typeMap = { 1: 0, 10: 2, 100: 1, 1000: 3, 1004: 4 } // QQ: 0=单曲,1=歌手,2=专辑,3=歌单,4=mv,暂不支持电台
  const mappedType = typeMap[stdType] ?? -1

  const searchData = {
    grp: 1,
    num_per_page: limit,
    page_num: pageNum,
    query: query.keywords,
    search_type: mappedType
  }

  const requestData = {
    comm: {
      ct: "19",
      cv: "1859",
      uin: "0"
    },
    req_1: {
      method: "DoSearchForQQMusicDesktop",
      module: "music.search.SearchCgiService",
      param: searchData
    }
  }

  // 发送POST请求
  return axios.post('http://u6.y.qq.com/cgi-bin/musicu.fcg', requestData, {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/131.0.0.0'
    }
  }).then(response => {

    if (!response.data || response.data.code !== 0) {
      throw new Error(response.data?.message || 'Search failed')
    }

    const searchResult = response.data.req_1?.data?.body || {}
    const hasMore = response.data.req_1.data.meta?.nextpage > 0

    // 根据平台实际映射类型返回结果格式（修复 type=1 传入时的结果类型错配）
    switch (mappedType) {
      case 0: // 单曲搜索
        return {
          result: {
            songs: searchResult.song.list.map(formatSongSearchResult),
            songCount: searchResult.song.list.length,
            hasMore: hasMore
          }
        }
      case 1: // 歌手搜索
        return {          
          result: {
            artists: searchResult.singer.list.map(formatSingerSearchResult),
            artistCount: searchResult.singer.list.length,
            hasMore: hasMore
          }
        }
      case 2: // 专辑搜索
        return {
          result: {
            albums: searchResult.album.list.map(formatAlbumSearchResult),
            albumCount: searchResult.album.list.length,
            hasMore: hasMore
          }
        }
      case 3: // 歌单搜索
        return {
          result: {
            playlists: searchResult.songlist.list.map(formatPlaylistSearchResult),
            playlistCount: searchResult.songlist.list.length,
            hasMore: hasMore
          }
        }
      case 4: // MV搜索
        return {
          result: {
            mvs: searchResult.mv.list.map(formatMvSearchResult),
            mvCount: searchResult.mv.list.length,
            hasMore: hasMore
          }
        }
      default:
        throw new Error('Unsupported search type')
    }
  }).catch(error => {
    throw error
  })
}

/**
 * 格式化单曲搜索结果
 */
function formatSongSearchResult(song) {
  return {
    id: song.id,
    mid: song.mid,
    name: song.name,
    ar: (song.singer || []).map(s => ({ id: s.mid, name: s.name })),
    al: {
      id: song.album ? song.album.id : 0,
      name: song.album ? song.album.name : '',
      picUrl: song.album?.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.album.mid}.jpg` : ''
    },
    dt: Number(song.interval || 0) * 1000,
    fee: song.pay.pay_play || 0,
    mv: song.mv.vid || '',
    alia: [song.subtitle],
    platform: "qqmusic"
  }
}
  
/**
 * 格式化歌手搜索结果, mid代替id
 */
function formatSingerSearchResult(singer) {
  return {
    id: singer.singerMID,
    name: singer.singerName,
    picUrl: singer.singerPic || '',
    platform: "qqmusic"
  }
}


/**
 * 格式化专辑搜索结果
 */
function formatAlbumSearchResult(album) {
  return {
    id: album.albumID,
    mid: album.albumMID,
    name: album.albumName,
    artist: album.singer_list ? album.singer_list.map(s => s.name).join(', ') : album.singerName || '',
    picUrl: album.albumPic || (album.albumMID ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${album.albumMID}.jpg` : ''),
    size: album.song_count || 0,
    publishTime: album.publicTime || '',
    company: album.company || '',
    platform: "qqmusic"
  }
}

/**
 * 格式化歌单搜索结果
 */
function formatPlaylistSearchResult(playlist) {
  return {
    id: playlist.dissid,
    name: playlist.dissname,
    coverImgUrl: playlist.imgurl || '',
    creator: {
      userId: playlist.creator?.creator_uin || 0,
      nickname: playlist.creator?.name || '',
      isVip: playlist.creator?.isVip || 0
    },
    trackCount: playlist.song_count || 0,
    playCount: playlist.listennum || 0,
    playCountStr: playlist.listennumstr || '',
    description: playlist.introduction || '',
    createTime: playlist.createtime || '',
    modifyTime: playlist.modifytime || '',
    platform: "qqmusic"
  }
}

/**
 * 格式化MV搜索结果
 */
function formatMvSearchResult(mv) {
  return {
    id: mv.v_id,
    name: mv.mv_name,
    artistName: mv.singer_name || '',
    artistId: mv.singermid || '',
    duration: Number(mv.duration || 0) * 1000,
    cover: mv.mv_pic_url || '',
    playCount: mv.play_count || 0,
    publishTime: mv.publish_date || '',
    platform: "qqmusic"
  }
}