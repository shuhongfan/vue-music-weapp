import request from "../../utils/request";
Page({
    data: {
        areas: [
            { text: '全部', value: '全部' },
            { text: '港台', value: '港台' },
            { text: '欧美', value: '欧美' },
            { text: '日本', value: '日本' },
            { text: '韩国', value: '韩国' },
        ],
        types: [
            { text: '全部', value: '全部' },
            { text: '官方版', value: '官方版'},
            { text: '原生', value: '原生' },
            { text: '现场版', value: '现场版' },
            { text: '网易出品', value: '网易出品' },
        ],
        orders: [
            { text: '上升最快', value: '上升最快' },
            { text: '最热', value: '最热'},
            { text: '最新', value: '最新' },
        ],
        area: '全部',
        type: '全部',
        order: '上升最快',
        // 导航便签数据
        videoGroupList: [],
        // 导航标识
        navID:'',
        // 视频列表数据
        videoList: [],
        // 视频id
        videoID: '',
        // video播放时长
        videoUpdateTime: [],
        // 表示下拉刷新是否被触发
        isTriggered: false,
        limit: 10, //取出数量
        offset: 0, // 偏移数量
        count: 0, // 总数量
        currentPage: 1,
        mvData: [],
        mvUrl: ''
    },
    onLoad: function (options) {
        // 获取导航数据
        this.getVideoGroupListData()
        // 获取全部MV的数据
        this.getMvData()
    },
    // 获取全部MV的数据
    async getMvData () {
        const {area,type,order,limit,offset} = this.data
        const result = await request('/mv/all',{area,type,order,limit,offset})
        console.log(result)
        this.setData({
            mvData: result.data,
            count: result.count,
            // 关闭下拉刷新
            isTriggered:false
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
    // 获取导航数据
    async getVideoGroupListData(){
        let videoGroupListData=await request('/video/group/list')
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0,14),
            navID: videoGroupListData.data[0].id
        })
        // 获取视频数据
        this.getVideoList(this.data.navID)
    },
    // 获取视频数据
    async getVideoList(navid){
      let videoListData=await request('/video/group',{
          id: navid,
          offset: this.data.offset
      })
      // 关闭加载框
      wx.hideLoading()

      let index=0
      let videoList=videoListData.datas.map(item=>{
          item.id=index++
          return item
      })
      this.setData({
          videoList,
          // 关闭下拉刷新
          isTriggered:false
      })
    },
    onAreaChange(val) {
        this.setData({ area: val.detail });
        this.getMvData()
    },
    onTypeChange(val) {
        this.setData({ type: val.detail });
        this.getMvData()
    },
    onOrderChange(val) {
        this.setData({ order: val.detail });
        this.getMvData()
    },
    // 点击切换导航的回调
    changeNav(event){
        // 通过id向event传参的时候如果传的是number会自动转换成string
        let navid=event.currentTarget.id
        console.log(typeof navid)
        let navid1=event.currentTarget.dataset.id
        console.log(typeof navid1)
        this.setData({
            // navID:navid * 1
            // 将目标先转换成二进制 然后移动指定的位数
            // 右移0位会将非number强制转换为number
            navID:navid >>> 0,
            videoList: []
        })
        // 显示正在加载
        wx.showLoading({
            title: '正在加载'
        })
        // 动态获取当前导航对应的视频数据
        this.getVideoList(this.data.navID)
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
    // 自定义下拉刷新回调
    handleReFresher () {
        console.log('scroll-view下拉刷新')
        this.setData({
            currentPage: this.data.currentPage + 1,
            offset: (this.data.currentPage - 1) * this.data.limit
        })
        // 再次发送请求 获取最新视频数据
        this.getMvData()
    },
    // 自定义上拉触底回调
    handleToLower (){
        console.log('scroll-view上拉刷新')
        this.setData({
            currentPage: this.data.currentPage + 1,
            offset: (this.data.currentPage - 1) * this.data.limit
        })
        // 再次发送请求 获取最新视频数据
        this.getMvData()
    },
    // 页面下拉刷新
    onPullDownRefresh() {
        console.log('页面下拉刷新')
    },
    // 页面的上拉触底
    onReachBottom() {
        console.log('页面的上拉触底')
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
    // 跳转搜索界面
    toSearch (){
        wx.navigateTo({
            url:'/pages/search/search'
        })
    }
});
