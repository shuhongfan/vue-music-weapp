import request from "../../../utils/request";

Page({
    data: {
        listId: 0,
        playListDetail: [],
        show: false
    },
    onLoad: function (options) {
        console.log(options)
        // 获取歌单id
        this.setData({
            listId: options.listId
        })
        // 获取歌单信息
        this.getPlayListDetail()
    },
    // 获取歌单信息
    async getPlayListDetail () {
        const result = await request('/playlist/detail',{id: this.data.listId})
        console.log(result)
        this.setData({
            playListDetail: result.playlist
        })
        wx.setNavigationBarTitle({
            title: this.data.playListDetail.name + ' - 凡音'
        })
    },
    showPopup() {
        this.setData({ show: true });
    },
    onClose() {
        this.setData({ show: false });
    },
    // 跳转至songDetail页面
    toSongDetail (event){
        // data-song="{{item}}"
        // let song=event.currentTarget.dataset.song
        // let index=event.currentTarget.dataset.index
        let {song,index} = event.currentTarget.dataset
        // console.log(index,song)
        this.setData({
            index
        })
        wx.navigateTo({
            // 不能将song对象作为参数传递 长度过长 会被截取
            // url:'/pages/songDetail/songDetail?song='+JSON.stringify(song)
            url:'/songPackage/pages/songDetail/songDetail?musicId='+song.id
        })
    }
});
