import request from "../../../utils/request";
Page({
    data: {
        person:{
            userName:'shf',
            age: 18
        }
    },
    onLoad: function (options) {

    },
    // 获取用户openid的回调
    handleGetOpenId (){
    // 1.获取登录凭证
        wx.login({
            success:async (res)=>{
                console.log(res)
                let code=res.code
                let result=await request('/getOpenId',{
                    code
                })
                console.log(result)
            }
        })
    //     2.将登录的凭证发送到服务器
    }
});
