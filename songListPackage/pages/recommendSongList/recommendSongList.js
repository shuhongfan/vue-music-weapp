import request from "../../../utils/request";
import PubSub from "pubsub-js";
const computedBehavior = require('miniprogram-computed')
Page({
    behaviors: [computedBehavior],//引入
    data: {
        cats: ['全部','欧美','华语','流行','说唱','摇滚','民谣','电子','轻音乐','影视原声','ACG','怀旧','治愈','旅行'],
        cat: '全部',
        limit: 18,
        currentPage: 1,
        recommendSongList: [],
        highqualitySongList: [],
        swiperH:'',//swiper高度
        nowIdx:0,//当前swiper索引
    },
    computed: {
        offset(data) {
            // 注意： computed 函数中不能访问 this ，只有 data 对象可供访问
            // 这个函数的返回值会被设置到 this.data.sum 字段中
            return (data.currentPage - 1) * data.limit
        },
    },
    onLoad: function (options) {
        // 获取精品歌单
        this.getHighqualitySongList()
        // 获取最新歌单
        this.getRecommendSongList()
    },
    // 获取精品歌单
    async getHighqualitySongList(){
        const res = await request('/top/playlist/highquality', {limit: 10})
        console.log('精品歌单：', res.playlists)
        this.setData({
            highqualitySongList: res.playlists
        })
    },
    // 获取最新歌单
    async getRecommendSongList(){
        const {limit,offset,cat} = this.data
        const res = await request('/top/playlist/', {limit,offset,cat})
        console.log('最新歌单：', res.playlists)
        this.setData({
            recommendSongList: res.playlists
        })
    },
    // 选择cat变换
    onChange(event) {
        // console.log(event)
        wx.showToast({
            title: `切换到 ${event.detail.title} 歌单`,
            icon: 'none',
        });
        this.setData({
            active: event.detail.title
        })
        this.getNewList()
    },
    // 跳转到歌单详情页
    goRecommendSong (event) {
        // console.log(event)
        const listId = event.currentTarget.dataset.id
        console.log(listId)
        wx.navigateTo({
            url: '/songListPackage/pages/playLists/playLists?listId='+listId
        })
    },
    //获取swiper高度
    getHeight:function(e){
        var winWid = wx.getSystemInfoSync().windowWidth - 2*50;//获取当前屏幕的宽度
        var imgh = e.detail.height;//图片高度
        var imgw = e.detail.width;
        var sH = winWid * imgh / imgw + "px"
        this.setData({
            swiperH: sH//设置高度
        })
    },
    //swiper滑动事件
    swiperChange:function(e){
        this.setData({
            nowIdx: e.detail.current
        })
    },
    getNewList () {
        this.setData({
            currentPage: this.data.currentPage + 1
        })
        this.getRecommendSongList()
    },
    async onPullDownRefresh () {
        await this.getNewList()
        await wx.stopPullDownRefresh()
    }
});
