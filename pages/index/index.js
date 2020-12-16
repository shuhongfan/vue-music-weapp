// pages/index/index.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 点击音乐的下标
    index: 0,
    // 轮播图数据
    bannerList: [],
    // 推荐歌单数据
    recommendList: [],
    // 最新音乐数据
    latestMusic: [],
    // 排行榜
    topList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 发送ajax获取数据
    this.getBanner()
    // 推荐歌单
    this.getPersonalized()
    // 获取最新音乐数据
    this.getLatestMusicList()
    // 排行榜
    this.getTopList('19723756')
    this.getTopList('3779629')
    this.getTopList('2884035')
    this.getTopList('3778678')
    this.getTopList('5213356842')
    this.getTopList('991319590')
    this.getTopList('71384707')
    this.getTopList('1978921795')

    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType',(msg, type)=>{
      console.log(msg, type)
      let {latestMusic,index}=this.data
      if (type==='pre'){ // 上一首
        (index===0) && (index=latestMusic.length)
        index-= 1
      } else { // 下一首
        (index===latestMusic.length-1)  && (index=-1)
        index+=1
      }
      // 更新下标
      this.setData({
        index
      })
      let musicId=latestMusic[index].id
      // 发布消息给songDetail页面
      PubSub.publish('musicId',musicId)
    })
  },
  // 获取轮播图banner
  async getBanner(){
    let bannerData = await request('/banner',{
      type: 2
    })
    console.log('结果数据',bannerData);
    this.setData({
      bannerList: bannerData.banners
    })
  },
  // 推荐歌单
  async getPersonalized (){
    let recommendList = await request('/personalized',{
      limit: 10
    })
    console.log('结果数据',recommendList);
    this.setData({
      recommendList: recommendList.result
    })
  },
  // 排行榜数据
  async getTopList (topListIds){
    // 需要根据idx的值获取对应的数据
    // idx的取值范围是0-20 我们需要0-4
    let index=0
    let resultArr=this.data.topList
    let topListData = await request('/playlist/detail',{
      id: topListIds
    })
    let topListItem={
      name:topListData.playlist.name,
      tracks:topListData.playlist.tracks.slice(0,3)
    }
    console.log('结果数据',topListItem)
    resultArr.push(topListItem)
    // 更新toplist的状态值 会导致页面长时间白屏 用户体验差
    this.setData({
      topList: resultArr
    })
  },
  // 获取最新音乐数据
  async getLatestMusicList(){
    let latestMusic=await request('/personalized/newsong')
    this.setData({
      latestMusic:latestMusic.result
    })
  },
  // 跳转至recommendSong
  toRecommendSong () {
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong'
    })
  },
  // 跳转至RankingList
  toRankingList () {
    wx.navigateTo({
      url: '/pages/rankingList/rankingList'
    })
  },
  // 跳转至songdetail
  toSongDetail(event){
    console.log(event)
    let {musicid,index} = event.currentTarget.dataset
    this.setData({
      index
    })

    // 发布消息给songDetail页面
    PubSub.publish('musicId',musicid)

    wx.navigateTo({
      url:'/songPackage/pages/songDetail/songDetail?musicId='+musicid
    })
  },
  // 跳转至RecommendSongList
  toRecommendSongList (event) {
    console.log(event)
    let {listid}=event.currentTarget.dataset
    wx.navigateTo({
      url:'/songListPackage/pages/recommendSongList/recommendSongList?listid='+listid
    })
  },
  to404 () {
    Notify({ type: 'warning', message: '上线中....' })
  },
  // 跳转搜索界面
  toSearch (){
    wx.navigateTo({
      url:'/pages/search/search'
    })
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
