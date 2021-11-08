/*
京喜牧场
更新时间：2021-11-7
活动入口：京喜APP-我的-京喜牧场
温馨提示：请先手动完成【新手指导任务】再运行脚本
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京喜牧场
20 0-23/3 * * * https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_jxmc.js, tag=京喜牧场, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true

================Loon==============
[Script]
cron "20 0-23/3 * * *" script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_jxmc.js,tag=京喜牧场

===============Surge=================
京喜牧场 = type=cron,cronexp="20 0-23/3 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_jxmc.js

============小火箭=========
京喜牧场 = type=cron,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_jxmc.js, cronexpr="20 0-23/3 * * *", timeout=3600, enable=true
 */
// prettier-ignore
const $ = new Env('京喜牧场');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//京喜APP的UA。领取助力任务奖励需要京喜APP的UA,环境变量：JX_USER_AGENT，有能力的可以填上自己的UA
$.inviteCodeList = [];
let cookiesArr = [];
let UA, token, UAInfo = {}
$.appId = 10028;
let cardinfo = {
  "16": "小黄鸡",
  "17": "辣子鸡",
  "18": "猪肚鸡",
  "19": "椰子鸡"
}
const petInfo = {
  "4": {
    name: "猪肚鸡",
    price: 412 * 1e3,
    weights: 2288.889 // 每个蛋的成本
  },
  "5": {
    name: "椰子鸡",
    price: 3355 * 1e2,
    weights: 2795.833
  },
  "3": {
    name: "辣子鸡",
    price: 2975 * 1e2,
    weights: 2975.0
  },
  "1": {
    name: "小黄鸡",
    price: 25 * 1e4,
    weights: 3125.0
  },
}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
  await requestAlgo();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  console.log('京喜牧场\n' +
      '更新时间：2021-11-7\n' +
      '活动入口：京喜APP-我的-京喜牧场\n' +
      '温馨提示：请先手动完成【新手指导任务】再运行脚本')
  for (let i = 0; i < cookiesArr.length; i++) {
    $.index = i + 1;
    $.cookie = cookiesArr[i];
    $.isLogin = true;
    $.nickName = '';
    UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    UAInfo[$.UserName] = UA
    await TotalBean();
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    token = await getJxToken()
    await pasture();
    await $.wait(2000);
  }

  await shareCodesFormat()
  for (let i = 0; i < cookiesArr.length; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.canHelp = true;
    $.index = i + 1;
    UA = UAInfo[$.UserName]
    token = await getJxToken()
    if ($.newShareCodes && $.newShareCodes.length) {
      console.log(`\n开始互助\n`);
      for (let j = 0; j < $.newShareCodes.length && $.canHelp; j++) {
        console.log(`账号${$.UserName} 去助力 ${$.newShareCodes[j]}`)
        $.delcode = false
        $.code = $.newShareCodes[j];
        await takeGetRequest('help');
        await $.wait(2000);
        if ($.delcode) {
          $.newShareCodes.splice(j, 1)
          j--
          continue
        }
      }
    } else {
      break
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function pasture() {
  try {
    $.homeInfo = {};
    $.petidList = [];
    $.crowInfo = {};
    await takeGetRequest('GetHomePageInfo');
    if (JSON.stringify($.homeInfo) === '{}') {
      console.log(`获取活动详情失败`);
      return;
    } else {
      if (!$.homeInfo.petinfo) {
        console.log(`\n温馨提示：${$.UserName} 请先手动完成【新手指导任务】再运行脚本再运行脚本\n`);
        return;
      }
      $.currentStep = $.homeInfo?.finishedtaskId
      console.log(`打印新手流程进度：当前进度：${$.currentStep}，下一流程：${$.homeInfo.maintaskId}`)
      if ($.homeInfo.maintaskId !== "pause" || isNew($.currentStep)) {
        console.log(`开始初始化`)
        $.step = isNew($.currentStep) ? isNew($.currentStep, true) : $.homeInfo.maintaskId
        await takeGetRequest('DoMainTask');
        for (let i = 0; i < 20; i++) {
          if ($.DoMainTask.maintaskId !== "pause") {
            await $.wait(2000)
            $.currentStep = $.DoMainTask?.finishedtaskId
            $.step = $.DoMainTask.maintaskId
            await takeGetRequest('DoMainTask');
          } else if (isNew($.currentStep)) {
            $.step = isNew($.currentStep, true)
            await takeGetRequest('DoMainTask');
          } else {
            console.log(`初始化成功\n`)
            break
          }
        }
      }
      console.log('获取活动信息成功');
      console.log(`互助码：${$.homeInfo.sharekey}`);
      $.taskList = [], $.dateType = ``, $.source = `jxmc`, $.bizCode = `jxmc`;
      await takeGetRequest('GetUserTaskStatusList');
      for (let key of Object.keys($.taskList)) {
        let vo = $.taskList[key]
        if (vo.taskName === "邀请好友助力养鸡" || vo.taskType === 4) {
          if (vo.completedTimes >= vo.configTargetTimes) {
            console.log(`助力已满，不上传助力码`)
          } else {
            $.inviteCodeList.push($.homeInfo.sharekey);
            await $.wait(2000)
          }
        }
      }
      const petNum = ($.homeInfo?.petinfo || []).length
      await takeGetRequest('GetCardInfo');
      if ($.GetCardInfo && $.GetCardInfo.cardinfo) {
        let msg = '';
        for (let vo of $.GetCardInfo.cardinfo) {
          if (vo.currnum > 0) {
            msg += `${vo.currnum}张${cardinfo[vo.cardtype]}卡片 `
          }
          if (petNum < 6) {
            $.cardType = vo.cardtype
            for (let i = vo.currnum; i >= vo.neednum; i -= vo.neednum) {
              console.log(`${cardinfo[vo.cardtype]}卡片已满${vo.neednum}张，去兑换...`)
              await $.wait(5000)
              await takeGetRequest("Combine")
            }
          }
        }
        console.log(`\n可抽奖次数：${$.GetCardInfo.times}${msg ? `,拥有卡片：${msg}` : ''}\n`)
        if ($.GetCardInfo.times !== 0) {
          console.log(`开始抽奖`)
          for (let i = $.GetCardInfo.times; i > 0; i--) {
            await $.wait(2000)
            await takeGetRequest('DrawCard');
          }
          console.log('')
        }
      }
      console.log("查看宠物信息")
      if (!petNum) {
        console.log(`你的鸡都生完蛋跑掉啦！！`)
        await buyNewPet(true)
      }
      for (let i = 0; i < petNum; i++) {
        $.onepetInfo = $.homeInfo.petinfo[i];
        const { bornvalue, progress, strong, type, stage } = $.onepetInfo
        switch (stage) {
          case 1:
            console.log(`这里有一只幼年${petInfo[type].name}，成长进度：${progress}%`)
            break
          case 2:
            console.log(`这里有一只青年${petInfo[type].name}，生蛋进度：${bornvalue}/${strong}，成长进度：${progress}%`)
            break
          case 4:
            console.log(`这里有一只壮年${petInfo[type].name}，离家出走进度（生蛋进度）：${bornvalue}/${strong}`)
            break
          default:
            console.log(`这里有一只不知道什么状态的鸡：${JSON.stringify($.onepetInfo)}`)
        }
        $.petidList.push($.onepetInfo.petid);
        if ($.onepetInfo.cangetborn === 1) {
          console.log(`开始收鸡蛋`);
          await takeGetRequest('GetEgg');
          await $.wait(1000);
        }
      }
      $.crowInfo = $.homeInfo.cow;
    }
    $.GetVisitBackInfo = {};
    await $.wait(2000);
    await takeGetRequest('GetVisitBackInfo');
    if ($.GetVisitBackInfo.iscandraw === 1) {
      await $.wait(2000);
      await takeGetRequest('GetVisitBackCabbage');
    }
    await $.wait(2000);
    $.GetSignInfo = {};
    await takeGetRequest('GetSignInfo');
    if (JSON.stringify($.GetSignInfo) !== '{}' && $.GetSignInfo.signlist) {
      let signList = $.GetSignInfo.signlist;
      for (let j = 0; j < signList.length; j++) {
        if (signList[j].fortoday && !signList[j].hasdone) {
          await $.wait(2000);
          console.log(`\n去签到`);
          await takeGetRequest('GetSignReward');
        }
      }
    }
    await $.wait(2000);
    if ($.crowInfo.lastgettime) {
      console.log('\n收奶牛金币');
      await takeGetRequest('cow');
      await $.wait(2000);
    }
    await $.wait(2000);
    await takeGetRequest('GetUserLoveInfo');
    if ($.GetUserLoveInfo) {
      for (let key of Object.keys($.GetUserLoveInfo)) {
        let vo = $.GetUserLoveInfo[key]
        if (vo.drawstatus === 1) {
          await $.wait(2000);
          $.lovevalue = vo.lovevalue;
          await takeGetRequest('DrawLoveHongBao');
        }
      }
    }
    $.taskList = [], $.dateType = ``, $.source = `jxmc`, $.bizCode = `jxmc`;
    for (let j = 2; j >= 0; j--) {
      if (j === 0) {
        $.dateType = ``;
      } else {
        $.dateType = j;
      }
      await takeGetRequest('GetUserTaskStatusList');
      await $.wait(2000);
      await doTask(j);
      await $.wait(2000);
      if (j === 2) {
        //割草
        console.log(`\n开始进行割草`);
        $.runFlag = true;
        for (let i = 0; i < 30 && $.runFlag; i++) {
          $.mowingInfo = {};
          console.log(`开始第${i + 1}次割草`);
          await takeGetRequest('mowing');
          await $.wait(2000);
          if ($.mowingInfo.surprise === true) {
            //除草礼盒
            console.log(`领取除草礼盒`);
            await takeGetRequest('GetSelfResult');
            await $.wait(3000);
          }
        }

        //横扫鸡腿
        $.runFlag = true;
        console.log(`\n开始进行横扫鸡腿`);
        for (let i = 0; i < 30 && $.runFlag; i++) {
          console.log(`开始第${i + 1}次横扫鸡腿`);
          await takeGetRequest('jump');
          await $.wait(2000);
        }
      }
    }
    if ($.GetUserLoveInfo) {
      $.taskList = [], $.dateType = `2`, $.source = `jxmc_zanaixin`, $.bizCode = `jxmc_zanaixin`;
      for (let j = 2; j >= 0; j--) {
        await takeGetRequest('GetUserTaskStatusList');
        await $.wait(2000);
        await doTask(j);
        await $.wait(2000);
      }
    }

    await takeGetRequest('GetHomePageInfo');
    await $.wait(2000);
    let materialNumber = 0;
    let materialinfoList = $.homeInfo.materialinfo;
    for (let j = 0; j < materialinfoList.length; j++) {
      if (materialinfoList[j].type !== 1) {
        continue;
      }
      materialNumber = Number(materialinfoList[j].value);//白菜数量
    }
    if (Number($.homeInfo.coins) > 5000) {
      let canBuyTimes = Math.floor(Number($.homeInfo.coins) / 5000);
      console.log(`\n共有金币${$.homeInfo.coins},可以购买${canBuyTimes}次白菜`);
      if (Number(materialNumber) < 400) {
        for (let j = 0; j < canBuyTimes && j < 4; j++) {
          console.log(`第${j + 1}次购买白菜`);
          await takeGetRequest('buy');
          await $.wait(2000);
        }
        await takeGetRequest('GetHomePageInfo');
        await $.wait(2000);
      } else {
        console.log(`现有白菜${materialNumber},大于400颗,不进行购买`);
      }
    } else {
      console.log(`\n共有金币${$.homeInfo.coins}`);
    }
    materialinfoList = $.homeInfo.materialinfo;
    for (let j = 0; j < materialinfoList.length; j++) {
      if (materialinfoList[j].type !== 1) {
        continue;
      }
      if (Number(materialinfoList[j].value) > 10) {
        $.canFeedTimes = Math.floor(Number(materialinfoList[j].value) / 10);
        console.log(`\n共有白菜${materialinfoList[j].value}颗，每次喂10颗，可以喂${$.canFeedTimes}次`);
        $.runFeed = true;
        for (let k = 0; k < $.canFeedTimes && $.runFeed && k < 40; k++) {
          $.pause = false;
          console.log(`开始第${k + 1}次喂白菜`);
          await takeGetRequest('feed');
          await $.wait(4000);
          if ($.pause) {
            await takeGetRequest('GetHomePageInfo');
            await $.wait(1000);
            for (let n = 0; n < $.homeInfo.petinfo.length; n++) {
              $.onepetInfo = $.homeInfo.petinfo[n];
              if ($.onepetInfo.cangetborn === 1) {
                console.log(`开始收鸡蛋`);
                await takeGetRequest('GetEgg');
                await $.wait(1000);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function buyNewPet(isHungery = false) {
  let weightsTemp = -1, nameTemp = ""
  for (let key in petInfo) {
    const onePet = petInfo[key]
    const { name, price, weights } = onePet
    if (price <= $.coins) {
      if (weights > weightsTemp) {
        weightsTemp = weights, nameTemp = name
        $.petType = key
      }
    }
  }
  if (weightsTemp !== -1) {
    await buy()
    if (!isHungery) await buyNewPet()
  } else {
    console.log("你目前没有金币可以直接购买鸡")
  }
  async function buy() {
    console.log("去买" + nameTemp)
    await takeGetRequest("BuyNew")
  }
}

async function doTask(j) {
  for (let i = 0; i < $.taskList.length; i++) {
    $.oneTask = $.taskList[i];
    //console.log($.oneTask.taskId);
    if ($.oneTask.dateType === 1) {//成就任务
      if ($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
        console.log(`完成任务：${$.oneTask.taskName}`);
        await takeGetRequest('Award');
        await $.wait(2000);
      }
    } else {//每日任务
      if ($.oneTask.awardStatus === 1) {
        if (j === 0) {
          console.log(`任务：${$.oneTask.taskName},已完成`);
        }
      } else if ($.oneTask.taskType === 4) {
        if ($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
          console.log(`完成任务：${$.oneTask.taskName}`);
          await takeGetRequest('Award');
          await $.wait(2000);
        } else if (j === 0) {
          console.log(`任务：${$.oneTask.taskName},未完成`);
        }
      } else if ($.oneTask.awardStatus === 2 && $.oneTask.taskCaller === 1) {//浏览任务
        if (Number($.oneTask.completedTimes) > 0 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
          console.log(`完成任务：${$.oneTask.taskName}`);
          await takeGetRequest('Award');
          await $.wait(2000);
        }
        for (let j = Number($.oneTask.completedTimes); j < Number($.oneTask.configTargetTimes); j++) {
          console.log(`去做任务：${$.oneTask.description}`);
          await takeGetRequest('DoTask');
          await $.wait(6000);
          console.log(`完成任务：${$.oneTask.description}`);
          await takeGetRequest('Award');
        }
      } else if ($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
        console.log(`完成任务：${$.oneTask.taskName}`);
        await takeGetRequest('Award');
        await $.wait(2000);
      }
    }
  }
}

async function takeGetRequest(type) {
  let url = ``;
  let myRequest = ``;
  switch (type) {
    case 'GetHomePageInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetHomePageInfo?channel=7&sceneid=1001&activeid=null&activekey=${$.activekey}&isgift=1&isquerypicksite=1`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetHomePageInfo`, url);
      break;
    case 'GetUserTaskStatusList':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/GetUserTaskStatusList?_=${Date.now() + 2}&source=${$.source}&bizCode=${$.bizCode}&dateType=${$.dateType}&showAreaTaskFlag=0&jxpp_wxapp_type=7`
      url += `&_stk=${getStk(url)}`
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&sceneval=2&g_login_type=1&g_ty=ajax`
      myRequest = getGetRequest(`GetUserTaskStatusList`, url);
      break;
    case 'mowing': //割草
      url = `https://m.jingxi.com/jxmc/operservice/Action?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&type=2&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`mowing`, url);
      break;
    case 'GetSelfResult':
      url = `https://m.jingxi.com/jxmc/operservice/GetSelfResult?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&type=14&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&itemid=undefined&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSelfResult`, url);
      break;
    case 'jump':
      let sar = Math.floor((Math.random() * $.petidList.length));
      url = `https://m.jingxi.com/jxmc/operservice/Action?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&type=1&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&petid=${$.petidList[sar]}&_stk=channel%2Cpetid%2Csceneid%2Ctype&_ste=1`
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`jump`, url);
      break;
    case 'DoTask':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/DoTask?_=${Date.now() + 2}&source=${$.source}&taskId=${$.oneTask.taskId}&bizCode=${$.bizCode}&configExtra=`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`DoTask`, url);
      break;
    case 'Award':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/Award?_=${Date.now() + 2}&source=${$.source}&taskId=${$.oneTask.taskId}&bizCode=${$.bizCode}`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`Award`, url);
      break;
    case 'cow':
      url = `https://m.jingxi.com/jxmc/operservice/GetCoin?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&token=${A($.crowInfo.lastgettime)}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Ctoken&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'buy':
      url = `https://m.jingxi.com/jxmc/operservice/Buy?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&type=1&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'feed':
      url = `https://m.jingxi.com/jxmc/operservice/Feed?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'GetEgg':
      url = `https://m.jingxi.com/jxmc/operservice/GetSelfResult?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&type=11&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&itemid=${$.onepetInfo.petid}&_stk=channel%2Citemid%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetEgg`, url);
      break;
    case 'help':
      url = `https://m.jingxi.com/jxmc/operservice/EnrollFriend?sharekey=${$.code}&channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Csharekey&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`help`, url);
      break;
    case 'GetVisitBackInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetVisitBackInfo?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetVisitBackInfo`, url);
      break;
    case 'GetVisitBackCabbage':
      url = `https://m.jingxi.com/jxmc/operservice/GetVisitBackCabbage?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetVisitBackCabbage`, url);
      break;
    case 'GetSignInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetSignInfo?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=activeid%2Cactivekey%2Cchannel%2Cjxmc_jstoken%2Cphoneid%2Csceneid%2Ctimestamp&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSignInfo`, url);
      break;
    case 'GetSignReward':
      url = `https://m.jingxi.com/jxmc/operservice/GetSignReward?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&currdate=${$.GetSignInfo.currdate}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=activeid%2Cactivekey%2Cchannel%2Ccurrdate%2Cjxmc_jstoken%2Cphoneid%2Csceneid%2Ctimestamp&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSignReward`, url);
      break;
    case 'DoMainTask':
      url = `https://m.jingxi.com/jxmc/operservice/DoMainTask?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&step=${$.step}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`DoMainTask`, url);
      break;
    case 'GetCardInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetCardInfo?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=activeid%2Cactivekey%2Cchannel%2Cjxmc_jstoken%2Cphoneid%2Csceneid%2Ctimestamp&_ste=1`
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetCardInfo`, url);
      break;
    case 'DrawCard':
      url = `https://m.jingxi.com/jxmc/operservice/DrawCard?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=activeid%2Cactivekey%2Cchannel%2Cjxmc_jstoken%2Cphoneid%2Csceneid%2Ctimestamp&_ste=1`
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`DrawCard`, url);
      break;
    case 'Combine':
      url = `https://m.jingxi.com/jxmc/operservice/Combine?channel=7&sceneid=1001&type=2&activeid=${$.activeid}&activekey=${$.activekey}&cardtype=${$.cardType}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`Combine`, url);
      break;
    case 'BuyNew':
      url = `https://m.jingxi.com/jxmc/operservice/BuyNew?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&type=${$.petType}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`BuyNew`, url);
      break;
    case 'GetUserLoveInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetUserLoveInfo?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetUserLoveInfo`, url);
      break;
    case 'DrawLoveHongBao':
      url = `https://m.jingxi.com/jxmc/operservice/DrawLoveHongBao?channel=7&sceneid=1001&activeid=${$.activeid}&activekey=${$.activekey}&lovevalue=${$.lovevalue}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}`;
      url += `&_stk=${getStk(url)}`;
      url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`DrawLoveHongBao`, url);
      break;
    default:
      console.log(`错误${type}`);
  }
  return new Promise(async resolve => {
    $.get(myRequest, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`API请求失败，请检查网路重试`)
          $.runFlag = false;
          console.log(`请求失败`)
        } else {
          dealReturn(type, data);
        }
      } catch (e) {
        console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function getStk(url) {
  let arr = url.split('&').map(x => x.replace(/.*\?/, "").replace(/=.*/, ""))
  return encodeURIComponent(arr.filter(x => x).sort().join(','))
}

function isNew(step, getNextStep = false) {
  const charArr = [...Array(26).keys()].map(i => String.fromCharCode(i + 65)),
      numArr = [...Array(12).keys()].map(i => i + 1)
  if (getNextStep) {
    const tempArr = step.split(`-`)
    tempArr[0] = charArr[charArr.indexOf(tempArr[0]) + 1]
    tempArr[1] = numArr[0]
    return tempArr.join("-")
  }
  const tempArr = step.split(`-`)
  if (tempArr.length < 2) return true
  const num = numArr.length * (charArr.indexOf(tempArr[0])) + (+tempArr[1]),
      orderArr = ['L', '6'] // 目标步骤
  const numTo = numArr.length * (charArr.indexOf(orderArr[0])) + (+orderArr[1])
  return num < numTo
}

function dealReturn(type, data) {
  switch (type) {
    case 'GetHomePageInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.homeInfo = data.data;
        $.activeid = $.homeInfo.activeid
        $.activekey = $.homeInfo.activekey || null
        $.coins = $.homeInfo?.coins || 0;
        if ($.homeInfo.giftcabbagevalue) {
          console.log(`登陆获得白菜：${$.homeInfo.giftcabbagevalue} 颗`);
        }
      } else {
        console.log(`获取活动信息异常：${JSON.stringify(data)}\n`);
      }
      break;
    case 'mowing':
    case 'jump':
    case 'cow':
      data = data.match(new RegExp(/jsonpCBK.?\((.*);*/));
      if (data && data[1]) {
        data = JSON.parse(data[1]);
        if (data.ret === 0) {
          $.mowingInfo = data.data;
          let add = ($.mowingInfo.addcoins || $.mowingInfo.addcoin) ? ($.mowingInfo.addcoins || $.mowingInfo.addcoin) : 0;
          console.log(`获得金币：${add}`);
          if (Number(add) > 0) {
            $.runFlag = true;
          } else {
            $.runFlag = false;
            console.log(`未获得金币暂停${type}`);
          }
        }
      } else {
        console.log(`cow 数据异常：${data}\n`);
      }
      break;
    case 'GetSelfResult':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`打开除草礼盒成功`);
        console.log(JSON.stringify(data));
      }
      break;
    case 'GetUserTaskStatusList':
      data = JSON.parse(data);
      if (data.ret === 0) {
        $.taskList = data.data.userTaskStatusList;
      }
      break;
    case 'Award':
      data = JSON.parse(data);
      if (data.ret === 0) {
        console.log(`领取金币成功，获得${JSON.parse(data.data.prizeInfo).prizeInfo}`);
      }
      break;
    case 'buy':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`购买成功，当前有白菜：${data.data.newnum}颗`);
      }
      break;
    case 'feed':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`投喂成功`);
      } else if (data.ret === 2020) {
        console.log(`投喂失败，需要先收取鸡蛋`);
        $.pause = true;
      } else {
        console.log(`投喂失败，${data.message}`);
        console.log(JSON.stringify(data));
        $.runFeed = false;
      }
      break;
    case 'GetEgg':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`成功收取${data.data.addnum}个蛋，现有鸡蛋${data.data.newnum}个`);
      }
      break;
    case 'DoTask':
      if (data.ret === 0) {
        console.log(`执行任务成功`);
      }
      break;
    case 'help':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        if (data.data.result === 0) {
          console.log(`助力成功`);
        } else if (data.data.result === 1) {
          console.log(`不能助力自己`);
        } else if (data.data.result === 3) {
          console.log(`该好友助力已满`);
          $.delcode = true;
        } else if (data.data.result === 4) {
          console.log(`助力次数已用完`);
          $.canHelp = false;
        } else if (data.data.result === 5) {
          console.log(`已经助力过此好友`);
        } else {
          console.log(JSON.stringify(data))
        }
      } else if (data.ret === 1016) {
        console.log(`活动太火爆了，还是去买买买吧~`);
        $.canHelp = false;
      } else {
        console.log(JSON.stringify(data))
      }
      break;
    case 'GetVisitBackInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.GetVisitBackInfo = data.data;
      }
      //console.log(JSON.stringify(data));
      break;
    case 'GetVisitBackCabbage':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`收取白菜成功，获得${data.data.drawnum}`);
      }
      break;
    case 'GetSignInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.GetSignInfo = data.data;
      }
      break;
    case 'GetSignReward':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`签到成功`);
      }
      break;
    case 'DoMainTask':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.DoMainTask = data.data;
      }
      break;
    case 'GetCardInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.GetCardInfo = data.data;
      }
      break;
    case 'DrawCard':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        if (data.data.prizetype === 1) {
          console.log(`抽奖获得：1张${cardinfo[data.data.cardtype]}卡片`)
        } else if (data.data.prizetype === 2) {
          console.log(`抽奖获得：${data.data.rewardinfo.prizevalue / 100}红包`)
        } else if (data.data.prizetype === 3) {
          console.log(`抽奖获得：${data.data.addcoins}金币`)
        } else {
          console.log(`抽奖获得：${JSON.stringify(data)}`)
        }
      }
      break;
    case 'Combine':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`兑换成功，当前小鸡数量：${data.data.currnum}`)
      } else {
        console.log(`Combine：${JSON.stringify(data)}`)
      }
      break;
    case 'BuyNew':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        const { costcoin, currnum, petid, type } = data.data
        $.coins -= costcoin
        console.log(`获得一只${petInfo[type].name}，宠物id：${petid}，当前拥有${currnum}只鸡`)
      } else {
        console.log(`BuyNew：${JSON.stringify(data)}`)
      }
      break;
    case 'GetUserLoveInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.GetUserLoveInfo = data.data.lovelevel
      }
      break;
    case 'DrawLoveHongBao':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`领取爱心奖励获得：${data.data.rewardinfo.prizevalue / 100}红包`)
      } else {
        console.log(`DrawLoveHongBao：${JSON.stringify(data)}`)
      }
      break;
    default:
      console.log(JSON.stringify(data));
  }
}
function getGetRequest(type, url) {
  const method = `GET`;
  let headers = {
    "Host": "m.jingxi.com",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "User-Agent": UA,
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "Referer": "https://st.jingxi.com/",
    "Cookie": $.cookie
  };
  return { url: url, method: method, headers: headers };
}
function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function getAuthorShareCode(url) {
  return new Promise(async resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 10000, headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      const tunnel = require("tunnel");
      const agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }
    $.get(options, async (err, resp, data) => {
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(10000)
    resolve();
  })
}

//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    $.newShareCodes = []
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.inviteCodeList, ...(readShareCodeRes.data || [])])];
    } else {
      $.newShareCodes = [...new Set([...$.inviteCodeList])];
    }
    console.log(`\n您将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}
function readShareCode() {
  return new Promise(async resolve => {
    $.get({url: `https://transfer.nz.lu/jxmc`, timeout: 30 * 1000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(JSON.stringify(err))
          console.log(`${$.name} readShareCode API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`\n随机取20个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(30 * 1000);
    resolve()
  })
}
function uploadShareCode(code) {
  return new Promise(async resolve => {
    $.post({url: `https://transfer.nz.lu/upload/jxmc?code=${code}&ptpin=${encodeURIComponent(encodeURIComponent($.UserName))}`, timeout: 30 * 1000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(JSON.stringify(err))
          console.log(`${$.name} uploadShareCode API请求失败，请检查网路重试`)
        } else {
          if (data) {
            if (data === 'OK') {
              console.log(`已自动提交助力码`)
            } else if (data === 'error') {
              console.log(`助力码格式错误，乱玩API是要被打屁屁的~`)
            } else if (data === 'full') {
              console.log(`车位已满，请等待下一班次`)
            } else if (data === 'exist') {
              console.log(`助力码已经提交过了~`)
            } else if (data === 'not in whitelist') {
              console.log(`提交助力码失败，此用户不在白名单中`)
            } else {
              console.log(`未知错误：${data}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(30 * 1000);
    resolve()
  })
}

function decrypt(time, stk, type, url) {
  stk = stk || (url ? getUrlData(url, '_stk') : '')
  if (stk) {
    const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
    let hash1 = '';
    if ($.fingerprint && $.token && $.enCryptMethodJD) {
      hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
    } else {
      const random = '5gkjB6SpmC9s';
      $.token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
      $.fingerprint = 5287160221454703;
      const str = `${$.token}${$.fingerprint}${timestamp}${$.appId}${random}`;
      hash1 = $.CryptoJS.SHA512(str, $.token).toString($.CryptoJS.enc.Hex);
    }
    let st = '';
    stk.split(',').map((item, index) => {
      st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
  } else {
    return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
  }
}

async function requestAlgo() {
  $.fingerprint = await generateFp();
  const options = {
    "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
    "headers": {
      'Authority': 'cactus.jd.com',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      //'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      'Content-Type': 'application/json',
      'Origin': 'https://st.jingxi.com',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://st.jingxi.com/',
      'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
    },
    'body': JSON.stringify({
      "version": "1.0",
      "fp": $.fingerprint,
      "appId": $.appId.toString(),
      "timestamp": Date.now(),
      "platform": "web",
      "expandParams": ""
    })
  }
  new Promise(async resolve => {
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['status'] === 200) {
              $.token = data.data.result.tk;
              let enCryptMethodJDString = data.data.result.algo;
              if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
              // console.log(`获取签名参数成功！`)
              // console.log(`fp: ${$.fingerprint}`)
              // console.log(`token: ${$.token}`)
              // console.log(`enCryptMethodJD: ${enCryptMethodJDString}`)
            } else {
              // console.log(`fp: ${$.fingerprint}`)
              console.log('request_algo 签名参数API请求失败:')
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

Date.prototype.Format = function (fmt) {
  var e,
      n = this, d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
      };
  /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
  for (var k in l) {
    if (new RegExp("(".concat(k, ")")).test(d)) {
      var t, a = "S+" === k ? "000" : "00";
      d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
    }
  }
  return d;
}

function getUrlData(url, name) {
  if (typeof URL !== "undefined") {
    let urls = new URL(url);
    let data = urls.searchParams.get(name);
    return data ? data : '';
  } else {
    const query = url.match(/\?.*/)[0].substring(1)
    const vars = query.split('&')
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=')
      if (pair[0] === name) {
        return vars[i].substr(vars[i].indexOf('=') + 1);
      }
    }
    return ''
  }
}

function generateFp() {
  let e = "0123456789";
  let a = 13;
  let i = '';
  for (; a--;)
    i += e[Math.random() * e.length | 0];
  return (i + Date.now()).slice(0, 16)
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
function getJxToken() {
  var _0x1e2686 = {
    'kElFH': 'abcdefghijklmnopqrstuvwxyz1234567890',
    'MNRFu': function(_0x433b6d, _0x308057) {
      return _0x433b6d < _0x308057;
    },
    'gkPpb': function(_0x531855, _0xce2a99) {
      return _0x531855(_0xce2a99);
    },
    'KPODZ': function(_0x3394ff, _0x3181f7) {
      return _0x3394ff * _0x3181f7;
    },
    'TjSvK': function(_0x2bc1b7, _0x130f17) {
      return _0x2bc1b7(_0x130f17);
    }
  };

  function _0xe18f69(_0x5487a9) {
    let _0x3f25a6 = _0x1e2686['kElFH'];
    let _0x2b8bca = '';
    for (let _0x497a6a = 0x0; _0x1e2686['MNRFu'](_0x497a6a, _0x5487a9); _0x497a6a++) {
      _0x2b8bca += _0x3f25a6[_0x1e2686['gkPpb'](parseInt, _0x1e2686['KPODZ'](Math['random'](), _0x3f25a6['length']))];
    }
    return _0x2b8bca;
  }
  return new Promise(_0x1b19fc => {
    let _0x901291 = _0x1e2686['TjSvK'](_0xe18f69, 0x28);
    let _0x5b2fde = (+new Date())['toString']();
    if (!$.cookie['match'](/pt_pin=([^; ]+)(?=;?)/)) {
      console['log']('此账号cookie填写不规范,你的pt_pin=xxx后面没分号(;)\n');
      _0x1e2686['TjSvK'](_0x1b19fc, null);
    }
    let _0x1bb53f = $.cookie['match'](/pt_pin=([^; ]+)(?=;?)/)[0x1];
    let _0x367e43 = $['md5']('' + decodeURIComponent(_0x1bb53f) + _0x5b2fde + _0x901291 + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy')['toString']();
    _0x1e2686['TjSvK'](_0x1b19fc, {
      'timestamp': _0x5b2fde,
      'phoneid': _0x901291,
      'farm_jstoken': _0x367e43
    });
  });
}
function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}$.md5=A
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
