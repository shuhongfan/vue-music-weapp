import request from "../../utils/request";
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({
    data: {
        windowHeight: 0,
        isloading: true,
        activeKey: '云音乐飙升榜',
        activeId: 19723756,
        rankingList: [
            {title: '云音乐飙升榜', id: 19723756},
            {title: '云音乐新歌榜', id: 3779629},
            {title: '网易原创歌曲榜', id: 2884035},
            {title: '云音乐热歌榜', id: 3778678},
            {title: '新说唱热歌榜', id: 5213356842},
            {title: '云音乐说唱榜', id: 991319590},
            {title: '云音乐古典音乐榜', id: 71384707},
            {title: '云音乐电音榜', id: 1978921795},
            {title: '抖音排行榜', id: 2250011882},
            {title: '云音乐ACG音乐榜', id: 71385702},
            {title: '云音乐韩语榜', id: 745956260},
            {title: '云音乐国电榜', id: 10520166},
            {title: '英国Q杂志中文版周榜', id: 2023401535},
            {title: 'UK排行榜周榜', id: 180106},
            {title: '美国Billboard周榜', id: 60198},
            {title: 'Beatport全球电子舞曲榜', id: 21845217},
            {title: 'iTunes榜', id: 11641012},
            {title: '日本Oricon数字单曲周榜', id: 60131},
            {title: '台湾Hito排行榜', id: 112463},
            {title: '云音乐欧美热歌榜', id: 2809513713},
            {title: '云音乐欧美新歌榜', id: 2809577409},
            {title: '法国 NRJ Vos Hits 周榜', id: 27135204},
            {title: '云音乐ACG动画榜', id: 3001835560},
            {title: '云音乐ACG游戏榜', id: 3001795926},
            {title: '云音乐ACG VOCALOID榜', id: 3001890046},
            {title: '中国新乡村音乐排行榜', id: 3112516681},
            {title: '云音乐日语榜', id: 5059644681},
            {title: '云音乐民谣榜', id: 5059661515},
            {title: '云音乐摇滚榜', id: 5059633707},
            {title: '云音乐古风榜', id: 5059642708},
            {title: '潜力爆款榜', id: 5338990334},
        ],
        rankingListData: []
    },
    onLoad: function (options) {
        let that = this;
        //获取屏幕高度
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    windowHeight: res.windowHeight
                });
                console.log("屏幕高度: " + res.windowHeight)
            }
        })

        // 获取排行榜数据
        this.getRankingList()
    },
    // 获取排行榜数据
    async getRankingList () {
        let rankingListData = await request('/playlist/detail',{
            id: this.data.activeId
        })
        // console.log(rankingListData)
        let topListItem={
            name:rankingListData.playlist.name,
            tracks:rankingListData.playlist.tracks
        }
        this.setData({
            rankingListData: topListItem
        })
        if (rankingListData.code == 200) {
            this.setData({
                isloading: false
            })
        }
    },
    onChange(event) {
        // console.log(event)
        const id = event.currentTarget.dataset.id
        const title = event.currentTarget.dataset.title
        Notify({ type: 'primary', message: '切换到 '+title })
        this.setData({
            activeId: id,
            isloading: true
        })
        // 获取排行榜数据
        this.getRankingList()
    },
    toRankListDetail (event) {
        let id = event.currentTarget.dataset.id
        wx.navigateTo({
            // 不能将song对象作为参数传递 长度过长 会被截取
            // url:'/pages/songDetail/songDetail?song='+JSON.stringify(song)
            url:'/songPackage/pages/songDetail/songDetail?musicId='+id
        })
    }
});