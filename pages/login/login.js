import request from "../../utils/request";

Page({
    data: {
        phone: '',
        password: ''
    },
    onLoad: function (options) {

    },
    handleInput (event) {
        // 方式1：id传值 传递一个值
        // let type = event.currentTarget.id
        // 方式2：data-key=value 传递多个值
        let type=event.currentTarget.dataset.type
        console.log(event,type,event.detail.value)
        this.setData({
            [type]: event.detail.value
        })
    },
    // 登录的回调
    async login(){
        // 收集表单项数据
        let {phone,password}=this.data
        // 前端验证
        // 1.内容为空
        // 2.手机号格式不正确
        // 3.手机号格式正确 验证通过
        if (!phone){
            wx.showToast({
                title: '手机号不能为空',
                icon: "none"
            })
            return ;
        }
        // 定义正则表达式
        let phoneReg=/^1(3|4|5|6|7|8|9)\d{9}$/
        console.log(phoneReg.test(phone))
        if (!phoneReg.test(phone)){
            wx.showToast({
                title: '手机号格式错误',
                icon: "none"
            })
            return ;
        }
        if (!password){
            wx.showToast({
                title:'密码不能为空',
                icon: "none"
            })
            return ;
        }
        // 后端验证
        let result = await request('/login/cellphone',{
            phone,
            password,
            isLogin: true
        })
        if (result.code==200){
            wx.showToast({
                title: '登录成功'
            })
            // 写入session
            wx.setStorageSync('userInfo',JSON.stringify(result.profile))
            wx.reLaunch({
                url: '/pages/personal/personal'
            })
        } else if(result.code==400){
            wx.showToast({
                title: '手机号错误',
                icon: "none"
            })
        } else if (result.code==502){
            wx.showToast({
                title:'密码错误',
                icon: "none"
            })
        } else {
            wx.showToast({
                title: '登录失败，请重新登录',
                icon: "none"
            })
        }
    }
});
