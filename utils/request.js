// 发送ajax请求

// 1.封装功能函数
// 功能点明确
// 函数内部应该保留固定代码
// 将动态的数据抽取成形参 由使用者根据自身的情况动态的传入实参
// 一个良好的功能函数应该设置形参的默认值

// 2.封装功能组件
// 功能点明确
// 组件内部保留静态代码
// 将动态的数据抽取成props餐护士 由使用者根据自身情况以标签形式传入props数据
// 一个良好的组件应该设置组件的必要性及数据类型

import config from '../utils/config'
export default (url,data={},method='GET')=>{
  // new promise初始化promise实例的状态为pending
  return new Promise((resolve,reject)=>{
    wx.request({
      url:config.host + url,
      data,
      method,
      // 设置请求头
      header:{
        cookie: wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item=>item.indexOf("MUSIC_U")!==-1):''
      },
      success: (res)=>{
        if (data.isLogin){
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        console.log('请求成功',res)
        // resolve修改promise的状态为成功状态 resolved
        resolve(res.data)
      },
      fail: (err)=>{
        console.log('请求失败',err)
        // reject修改promise的状态为失败状态 rejected
        reject(err)
      }
    })
  })
}
