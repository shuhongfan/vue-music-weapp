// 手指起始的坐标
import request from "../../utils/request";

let startY=0;
// 手指移动的坐标
let moveY=0;
// 手指移动的距离
let moveDistance=0;

Page({
    data: {
        coverTransform:'translateY(0rpx)',
        coverTransition: '',
        // 用户信息
        userInfo: '',
        // 用户播放记录
        recentPlayList: []
    },
    onLoad: function (options) {
        // 读取用户信息
        let userInfo=wx.getStorageSync('userInfo')
        console.log(userInfo)
        if (userInfo){
            // 更新userInfo状态
            this.setData({
                userInfo: JSON.parse(userInfo)
            })
            // 获取用户播放记录
            this.getUserRecentPlayList(this.data.userInfo.userId)
        }
    },
    async getUserRecentPlayList(userid){
        let recentPlayListData = await request('/user/record',{
            uid: userid,
            type: 0
        })
        let index=0
        let recentPlayList=recentPlayListData.allData.splice(0,10).map(item=>{
            item.id=index++
            return item
        })
        this.setData({
            recentPlayList: recentPlayList
        })
    },
    handleTouchStart(event){
        this.setData({
            coverTransition: ''
        })
        // 获取手指的起始坐标
        startY=event.touches[0].clientY
    },
    handleTouchMove(event){
        moveY=event.touches[0].clientY
        moveDistance = moveY - startY
        if (moveDistance<0){
            return ;
        }
        if (moveDistance>80){
            moveDistance=80
        }
        // 动态更新coverTransform的状态值
        this.setData({
            coverTransform:`translateY(${moveDistance}rpx)`,
            coverTransition:`all 1s linear`
        })
    },
    handleTouchEnd(){
        this.setData({
            coverTransform:`translateY(0rpx)`
        })
    },
    toLogin () {
        wx.navigateTo({
            url: '/pages/login/login'
        })
    }
});
