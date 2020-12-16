import request from "../../../utils/request";
import PubSub from 'pubsub-js'
import Moment from "moment"

// 获取全局实例
const appInstance = getApp()

Page({
    data: {
        // 音乐是否播放
        isPlay: false,
        // 歌曲详情对象
        song:{},
        // 音乐id
        musicId: '',
        //音乐的链接
        musicLink:'',
        // 当前播放时间
        currentTime: '00:00',
        // 音乐时长
        durationTime: '00:00',
        // 实时进度条长度
        currentWidth: 0
    },
    onLoad: function (options) {
        // options用来接收路由跳转的query参数
        // 原生小程序中路由传参，对参数的长度有限制
        console.log(options)
        // console.log(JSON.parse(options.song))
        let musicId=options.musicId
        this.setData({
            musicId
        })
        this.getMusicInfo(musicId)

        this.backgroundAudioManager=wx.getBackgroundAudioManager()
        // 判断当前页面音乐是否在播放
        if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId===musicId){
            this.setData({
                isPlay:true
            })
        } else {
            this.setData({
                isPlay:false
            })
            this.changePlayState(false)
            this.setData({
                isPlay:true
            })
            this.musicControl(this.data.isPlay,musicId)
        }

        // 如果用户操作系统的控制音乐播放、暂停按钮，页面不知道，导致页面显示的播放状态不一致
        // 通过控制音频的实例backgroundAudioManager 去监视音乐的播放、暂停
        // 创建控制音乐播放的实例

        this.backgroundAudioManager.onPlay(()=>{
            console.log('Play')
            this.changePlayState(true)
            // 修改全局音乐播放的状态
            appInstance.globalData.musicId=musicId
        })
        this.backgroundAudioManager.onPause(()=>{
            console.log('Pause')
            this.changePlayState(false)
        })
        this.backgroundAudioManager.onStop(()=>{
            console.log('Stop')
            this.changePlayState(false)
        })
        // 监听音乐播放自然结束
        this.backgroundAudioManager.onEnded(()=>{
            // 自动切换至下一首音乐 并且自动播放
            PubSub.publish('switchType','next')
            // 将实时进度条的长度还原成0
            this.setData({
                currentTime: '00:00',
                durationTime: '00:00'
            })
        })
        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(()=>{
            // console.log('总时长：'+this.backgroundAudioManager.duration)
            // console.log('实时的时长：'+this.backgroundAudioManager.currentTime)
            // 格式化实时时间
            let currentTime=Moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss')
            let currentWidth=this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration*450
            this.setData({
                currentTime,
                currentWidth
            })
        })
    },
    // 点击播放暂停回调
    handleMusicPlay (){
        let isPlay=!this.data.isPlay
        // 修改是否播放状态
        // this.setData({
        //     isPlay
        // })
        let {musicId,musicLink}=this.data
        this.musicControl(isPlay,musicId,musicLink)
    },
    // 获取音乐详情功能函数
    async getMusicInfo(musicId){
        let songData=await request('/song/detail',{
            ids:musicId
        })
        // moment格式化
        let durationTime=Moment(songData.songs[0].dt).format('mm:ss')
        this.setData({
            song:songData.songs[0],
            durationTime
        })
        // 动态修改标题
        wx.setNavigationBarTitle({
            title:this.data.song.name + ' - 凡音'
        })
    },
    // 控制音乐播放、暂停的功能函数
    async musicControl(isPlay,musicId,musicLink){
        if (isPlay){ // 音乐播放
            if (!musicLink){
                // 获取音乐播放链接
                let musicLinkData=await request('/song/url',{
                    id:musicId
                })
                musicLink=musicLinkData.data[0].url
                this.setData({
                    musicLink
                })
            }
            this.backgroundAudioManager.src=musicLink
            this.backgroundAudioManager.title=this.data.song.name + ' - 凡音'
        } else { // 暂停
            this.backgroundAudioManager.pause()
        }
    },
    // 修改播放状态的功能函数
    changePlayState(isPlay){
        // 修改是否播放状态
        this.setData({
            isPlay
        })
        // 修改全局音乐播放的状态
        appInstance.globalData.isMusicPlay=isPlay
    },
    // 点击切歌回调
    handleSwitch (event){
        let type=event.target.id
        console.log(type)
        // 关闭当前播放的音乐
        this.backgroundAudioManager.stop()

        // 发布消息数据给recommendSong页面
        PubSub.publish('switchType',type)

        // 订阅来自recommendsong页面发布的musicId消息
        PubSub.subscribe('musicId',(msg,musicId)=>{
            console.log(musicId)
            // 获取新音乐的详细信息
            this.getMusicInfo(musicId)
            // 自动播放音乐
            this.musicControl(true,musicId)
            // 取消订阅
            PubSub.unsubscribe('musicId')
        })
    }
});
