//app.js
import wxValidate from 'utils/wxValidate'
var vm;
const util = require('/utils/util.js')

App({
  onLaunch: function () {
    vm = this
  },
  //判断
  appOnReady: function () {
    //获取用户缓存数据
    var userInfo = wx.getStorageSync("userInfo");
    console.log("local storage userInfo:" + JSON.stringify(userInfo), !util.judgeIsAnyNullStr(userInfo));
    //如果有缓存，代表已经注册过
    if (!util.judgeIsAnyNullStr(userInfo)) {
      vm.globalData.userInfo = wx.getStorageSync("userInfo");
      console.log("vm.globalData.userInfo:" + JSON.stringify(vm.globalData.userInfo));
      var now = new Date().getTime();
      var StorageTime = wx.getStorageSync("userInfo").StorageTime;
      console.log("缓存时间:", now - StorageTime)
      if (now - StorageTime > 3600) {
        //调用登录接口
        vm.login(null);
      }
    } else {
      //调用登录接口
      vm.login(null);
    }
  },
  //登录处理
  login: function (callBack) {
    //通过login获取code，再通过code获取用户openid
    wx.login({
      success: function (res) {
        console.log("wx.login:" + JSON.stringify(res))
        if (res.code) {
          util.getOpenId({ code: res.code }, function (ret) {
            console.log("getOpenId:" + JSON.stringify(ret))
            if (ret.data.result) {
              var openId = ret.data.ret.openid;
              var param = {
                xcx_openid: openId,
                account_type: "xcx"
              }
              vm.loginServer(param);
            }
          }, null)
        }
      }
    })
  },
  //远程调用登录接口
  loginServer: function (param) {
    console.log("loginServer param:" + JSON.stringify(param))
    util.login(param, function (ret) {
      console.log("login:" + JSON.stringify(ret))
      //如果登录成功，跳转到首页
      if (ret.data.result) {
        vm.globalData.user = ret.data.ret;
        vm.storeUserInfo(ret.data.ret)
        console.log("登录成功", vm.globalData.user)
      } else {
        //登录失败，则引导到进行注册的页面
        console.log("登录失败", param)
        util.navigateToRegister(param);   //将openid带过去
      }

    }, null)
  },

  wxValidate: function (rules, messages) { new wxValidate(rules, messages) },
  //向globalData中存储数据
  storeUserInfo: function (obj) {
    if (util.judgeIsAnyNullStr(obj.token))
      obj.token = vm.globalData.userInfo.token;
    obj.StorageTime = new Date().getTime();
    console.log("storeUserInfo :" + JSON.stringify(obj))
    wx.setStorage({
      key: "userInfo",
      data: obj
    })
    vm.globalData.userInfo = obj
  },
  globalData: {
    userInfo: null,
  }

})