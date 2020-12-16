import request from "../../utils/request";
Page({
    data: {
        windowHeight: 0,
        keywords: '',
        limit: 15,
        offset: 0,
        type: 1,
        songs: [],
        hasMore: false,
        songCount: 0,
        playlists:[],
        playlistsHasMore: false,
        playlistCount: 0,
        mvs: [],
        mvCount: 0,
        // 视频id
        videoID: '',
        // video播放时长
        videoUpdateTime: [],
        // 表示下拉刷新是否被触发
        isTriggered: false,
        mvUrl: ''
    },
    onLoad: function (options) {
        let that = this;
        //获取屏幕高度
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    windowHeight: res.windowHeight -110
                });
                console.log("屏幕高度: " + res.windowHeight)
            }
        })
        console.log(options)
        // 获取关键字
        this.setData({
            keywords: options.keywords
        })
        // 获取搜索结果
        this.getSearchList()
    },
    onSearch (event) {
        console.log(event.detail)
        if (event.detail == ''){
            wx.showToast({
                title: `请输入关键词`,
                icon: 'loading',
            });
        }
        this.setData({
            keywords: event.detail
        })
        this.getSearchList()
    },
    onCancel (event) {
        wx.navigateTo({
            url:'/pages/search/search'
        })
    },
    loadScrolltolower: function () {
        console.log('loadScrolltolower')
        this.setData({
            limit: this.data.limit + 10
        })
        const {hasMore,type,playlistsHasMore} = this.data
        if (type == 1 && hasMore==true || type == 1000 && playlistsHasMore==true || type == 1004) this.getSearchList()
    },
    // 获取搜索结果
    async getSearchList () {
        const {keywords,limit,offset,type} = this.data
        const result = await request('/search',{
            keywords,limit,offset,type
        })
        console.log(result)
        if (type==1){
            this.setData({
                songs: result.result.songs,
                hasMore: result.result.hasMore,
                songCount: result.result.songCount
            })
        } else if (type==1000){
            this.setData({
                playlists: result.result.playlists,
                playlistsHasMore: result.result.hasMore,
                playlistCount: result.result.playlistCount
            })
        } else {
            this.setData({
                mvs: result.result.mvs,
                mvCount: result.result.mvCount
            })
        }
    },
    onChange(event) {
        console.log(event)
        this.setData({
            type: event.detail.name,
            limit: 15
        })
        wx.showToast({
            title: `切换到 ${event.detail.title}`,
            icon: 'success',
        });
        // 获取搜索结果
        this.getSearchList()
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
    },
    goRecommendSong (event) {
        // console.log(event)
        const listId = event.currentTarget.dataset.id
        console.log(listId)
        wx.navigateTo({
            url: '/songListPackage/pages/playLists/playLists?listId='+listId
        })
    },
    // 获取MV地址
    async getMvUrl () {
        const result = await request('/mv/url',{id:this.data.videoID})
        console.log(result)
        this.setData({
            mvUrl: result.data.url
        })
    },
    // 点击播放/继续播放的回调
    async handlePlay (event){
        // 问题 多个视频同时播放的问题
        // 如何找到上一个视频的实例对象
        // 如何确定点击播放的视频和正在播放的视频不是同一个视频
        // 单例模式 需要创建多个对象的场景下 通过一个变量接收 始终保持只有一个对象
        let vid=event.currentTarget.id
        // 关闭上一个播放的视频
        this.vid !== vid && this.videoContext && this.videoContext.stop()
        this.vid=vid
        // 更新data中的videoID的状态数据
        this.setData({
            videoID:vid
        })
        // 获取MVurl地址
        await this.getMvUrl()
        // 创建控制video标签的实例对象
        this.videoContext = await wx.createVideoContext(vid)
        // 判断当前的视频之前是否播放过，是否有播放记录，如果有跳转至指定的播放位置
        let {videoUpdateTime} = this.data
        let videoItem=videoUpdateTime.find(item=>item.vid===vid)
        if (videoItem){
            this.videoContext.seek(videoItem.currentTime)
        }
        await this.videoContext.play()
    },
    // 监听视频播放进度的回调
    handleTimeUpdate(event){
        // console.log(event)
        let videoTimeObj={
            vid:event.currentTarget.id,
            currentTime:event.detail.currentTime
        }
        let { videoUpdateTime } = this.data
        // 判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
        // 1.如果有，在原有的播放记录中修改播放时间为当前播放时间
        // 2.如果没有，需要在数组中添加当前视频的播放对象
        let videoItem = videoUpdateTime.find(item=>item.vid===videoTimeObj.vid)
        // console.log(videoItem)
        if (videoItem){
            videoItem.currentTime=event.detail.currentTime
        } else {
            videoUpdateTime.push(videoTimeObj)
        }
        // 更新状态
        this.setData({
            videoTimeObj
        })
    },
    // 视频播放结束调用
    handleEnded (event){
        console.log('播放结束')
        // 移除记录播放时长数组中当前视频的对象
        let {videoUpdateTime}=this.data
        let id=videoUpdateTime.findIndex(item=>item.vid===event.currentTarget.id)
        videoUpdateTime.splice(id,1)
        this.setData({
            videoUpdateTime
        })
    },
    // 用户点击右上角分享
    onShareAppMessage({from}) {
        console.log(from)
        // button：页面内转发按钮
        // menu：右上角转发菜单
        if (from==='button'){
            return{
                title:'来自button的转发',
                page:'/pages/video/video',
                imageUrl:'/static/images/nvsheng.jpg'
            }
        } else {
            return{
                title:'来自menu的转发',
                page:'/pages/video/video',
                imageUrl:'/static/images/nvsheng.jpg'
            }
        }
    },
});
