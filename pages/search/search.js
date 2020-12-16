import request from "../../utils/request";
let isSend=false
Page({
    data: {
        // placeholder内容
        placeholderContent:'',
        // 热搜榜数据
        hotList:[],
        // 用户输入的表单项数据
        searchContent: '',
        // 模糊匹配的数据
        searchList:[],
        // 搜索的历史记录
        historyList: []
    },
    onLoad: function (options) {
        // 初始化数据
        this.getInitData()
        // 获取历史记录
        this.getSearchHistory()
    },
    // 获取初始化数据
    async getInitData(){
        let placeholderData=await request('/search/default')
        let hotListData=await request('/search/hot/default')
        this.setData({
            placeholderContent:placeholderData.data.showKeyword,
            hotList:hotListData.result.hots
        })
    },
    // 表单项内容发生改变的回调
    handleInputChange (event){
        console.log(event)
        // 更新searchContent数据
        this.setData({
            searchContent: event.detail.value.trim()
        })
        if (isSend) return
        isSend=true

        // 获取数据
        this.getSearchList()

        // 函数节流 每隔300毫秒执行一次
        setTimeout(()=>{
            isSend=false
        },300)
    },
    // 获取搜索数据的功能函数
    async getSearchList(){
        if (!this.data.searchContent) {
            this.setData({
                searchContent:''
            })
            return
        }
        let {searchContent,historyList}=this.data
        // 发请求获取关键字模糊匹配数据
        let searchListData=await request('/search',{
            keywords:searchContent,
            limit:10
        })
        this.setData({
            searchList:searchListData.result.songs
        })
        // 将搜索的关键字添加到搜索历史记录中
        if (historyList.indexOf(searchContent)!==-1){ // 判断以前是否搜索过
            historyList.splice(historyList.indexOf(searchContent),1)
        }
        historyList.unshift(searchContent)
        this.setData({
            historyList
        })
        wx.setStorageSync('searchHistory',historyList)
    },
    // 获取本地历史记录的功能函数
    getSearchHistory(){
        let historyList=wx.getStorageSync('searchHistory')
        if (historyList){
            this.setData({
                historyList
            })
        }
    },
    // 清空搜索内容
    clearSearchContent (){
        this.setData({
            searchContent: '',
            searchList:[]
        })
    },
    // 删除搜索历史记录
    deleteSearchHistory (){
        wx.showModal({
            content:'确认删除吗？',
            success:(res)=>{
                console.log(res)
                if (res.confirm){
                    // 清空data中historyList
                    this.setData({
                        historyList: []
                    })
                    // 移除本地的历史记录缓存
                    wx.removeStorageSync('searchHistory')
                }
            }
        })
    },
    // 跳转到音乐详情页
    toSearchList (keywords) {
        wx.navigateTo({
            url:'/pages/searchList/searchList?keywords='+keywords
        })
    },
    handleHotItem (item) {
        console.log(item)
        const keywords = item.currentTarget.dataset.item.first
        this.toSearchList(keywords)
    },
    handleSearchContent (item) {
        console.log(item)
        const keywords = item.currentTarget.dataset.item.name
        this.toSearchList(keywords)
    },
    handleHistoryItem (item) {
        console.log(item)
        const keywords = item.currentTarget.dataset.item
        this.toSearchList(keywords)
    },
    goback () {
        wx.navigateBack()
    }
});
