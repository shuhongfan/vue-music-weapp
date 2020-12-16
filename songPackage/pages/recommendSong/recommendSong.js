import request from "../../../utils/request";
import PubSub from 'pubsub-js'
Page({
    data: {
        // 天
        day:'',
        // 日
        month:'',
        // 推荐列表数据
        recommendList:[],
        // 点击音乐的下标
        index: 0
    },
    onLoad: function (options) {
        // 判断用户是否登录
        let userInfo=wx.getStorageSync('userInfo')
        if (!userInfo){
            wx.showToast({
                title:'请先登录',
                icon:"none",
                success:()=>{
                    // 跳转到登录页
                    wx.reLaunch({
                        url:'/pages/login/login'
                    })
                }
            })
        }
        // 更新日期的状态数据
        this.setData({
            day:new Date().getDate(),
            month:new Date().getMonth()+1
        })
        // 获取每日推荐数据
        this.getRecommendList()

        // 订阅来自songDetail页面发布的消息
        PubSub.subscribe('switchType',(msg, type)=>{
            console.log(msg, type)
            let {recommendList,index}=this.data
            if (type==='pre'){ // 上一首
                (index===0) && (index=recommendList.length)
                index-= 1
            } else { // 下一首
                (index===recommendList.length-1)  && (index=-1)
                index+=1
            }
            // 更新下标
            this.setData({
                index
            })
            let musicId=recommendList[index].id
            // 发布消息给songDetail页面
            PubSub.publish('musicId',musicId)
        })
    },
    // 获取每日推荐数据
   async getRecommendList(){
       let recommendListData=await request('/recommend/songs')
       console.log(recommendListData)
       this.setData({
           recommendList: recommendListData.data.dailySongs
       })
   },
    // 跳转至songDetail页面
    toSongDetail (event){
        // data-song="{{item}}"
        // let song=event.currentTarget.dataset.song
        // let index=event.currentTarget.dataset.index
        let {song,index} = event.currentTarget.dataset
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
