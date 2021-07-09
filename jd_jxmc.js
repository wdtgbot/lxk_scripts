/*
惊喜牧场
更新时间：2021-6-8
活动入口：京喜APP-我的-京喜牧场
温馨提示：请先手动完成【新手指导任务】再运行脚本
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#惊喜牧场
20 0-23/3 * * * jd_jxmc.js, tag=惊喜牧场, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true

================Loon==============
[Script]
cron "20 0-23/3 * * *" script-path=jd_jxmc.js,tag=惊喜牧场

===============Surge=================
惊喜牧场 = type=cron,cronexp="20 0-23/3 * * *",wake-system=1,timeout=3600,script-path=jd_jxmc.js

============小火箭=========
惊喜牧场 = type=cron,script-path=jd_jxmc.js, cronexpr="20 0-23/3 * * *", timeout=3600, enable=true
 */
// prettier-ignore
const $ = new Env('惊喜牧场');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.inviteCodeList = [];
let cookiesArr = [];
$.appId = 10028;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
  await requestAlgo();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('惊喜牧场\n' +
      '更新时间：2021-6-8\n' +
      '活动入口：京喜APP-我的-京喜牧场\n' +
      '温馨提示：请先手动完成【新手指导任务】再运行脚本')
  for (let i = 0; i < cookiesArr.length; i++) {
    $.index = i + 1;
    $.cookie = cookiesArr[i];
    $.isLogin = true;
    $.nickName = '';
    await TotalBean();
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    await pasture();
    await $.wait(3000);
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
      return;
    } else {
      if (!$.homeInfo.petinfo) {
        console.log(`\n温馨提示：${$.UserName} 请先手动完成【新手指导任务】再运行脚本再运行脚本\n`);
        return;
      }
      console.log('获取活动信息成功');
      for (let i = 0; i < $.homeInfo.petinfo.length; i++) {
        $.onepetInfo = $.homeInfo.petinfo[i];
        $.petidList.push($.onepetInfo.petid);
        if ($.onepetInfo.cangetborn === 1) {
          console.log(`开始收鸡蛋`);
          await takeGetRequest('GetEgg');
          await $.wait(1000);
        }
      }
      $.crowInfo = $.homeInfo.cow;
    }

    await $.wait(2000);
    if ($.crowInfo.lastgettime) {
      console.log('收奶牛金币');
      await takeGetRequest('cow');
      await $.wait(2000);
    }
    $.taskList = [];
    $.dateType = ``;
    for (let j = 2; j >= 0; j--) {
      if (j === 0) {
        $.dateType = ``;
      } else {
        $.dateType = j;
      }
      await takeGetRequest('GetUserTaskStatusList');
      await $.wait(2000);
      await doTask();
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
            await $.wait(5000);
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
    await takeGetRequest('GetHomePageInfo');
    await $.wait(2000);

    if (Number($.homeInfo.coins) > 5000) {
      let canBuyTimes = Math.floor(Number($.homeInfo.coins) / 5000);
      console.log(`\n共有金币${$.homeInfo.coins},可以购买${canBuyTimes}次白菜`);
      for (let j = 0; j < canBuyTimes; j++) {
        console.log(`第${j + 1}次购买白菜`);
        await takeGetRequest('buy');
        await $.wait(2000);
      }
      await takeGetRequest('GetHomePageInfo');
      await $.wait(2000);
    }
    let materialinfoList = $.homeInfo.materialinfo;
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
          await $.wait(2000);
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

async function doTask() {
  for (let i = 0; i < $.taskList.length; i++) {
    $.oneTask = $.taskList[i];
    if ($.oneTask.dateType === 1) {//成就任务
      if ($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
        console.log(`完成任务：${$.oneTask.taskName}`);
        await takeGetRequest('Award');
        await $.wait(2000);
      }
    } else {//每日任务
      if ($.oneTask.awardStatus === 2 && $.oneTask.taskCaller === 1) {//浏览任务
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
      url = `https://m.jingxi.com/jxmc/queryservice/GetHomePageInfo?channel=7&sceneid=1001&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetHomePageInfo`, url);
      break;
    case 'GetUserTaskStatusList':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/GetUserTaskStatusList?_=${Date.now() + 2}&source=jxmc&bizCode=jxmc&dateType=${$.dateType}&_stk=bizCode%2CdateType%2Csource&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`GetUserTaskStatusList`, url);
      break;
    case 'mowing': //割草
      url = `https://m.jingxi.com/jxmc/operservice/Action?channel=7&sceneid=1001&type=2&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`mowing`, url);
      break;
    case 'GetSelfResult':
      url = `https://m.jingxi.com/jxmc/operservice/GetSelfResult?channel=7&sceneid=1001&type=14&itemid=undefined&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSelfResult`, url);
      break;
    case 'jump':
      let sar = Math.floor((Math.random() * $.petidList.length));
      url = `https://m.jingxi.com/jxmc/operservice/Action?channel=7&sceneid=1001&type=1&petid=${$.petidList[sar]}&_stk=channel%2Cpetid%2Csceneid%2Ctype&_ste=1`
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`jump`, url);
      break;
    case 'DoTask':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/DoTask?_=${Date.now() + 2}&source=jxmc&taskId=${$.oneTask.taskId}&bizCode=jxmc&configExtra=&_stk=bizCode%2CconfigExtra%2Csource%2CtaskId&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}` + `&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`DoTask`, url);
      break;
    case 'Award':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/Award?_=${Date.now() + 2}&source=jxmc&taskId=${$.oneTask.taskId}&bizCode=jxmc&_stk=bizCode%2Csource%2CtaskId&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}` + `&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`Award`, url);
      break;
    case 'cow':
      url = `https://m.jingxi.com/jxmc/operservice/GetCoin?channel=7&sceneid=1001&token=${A($.crowInfo.lastgettime)}&_stk=channel%2Csceneid%2Ctoken&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'buy':
      url = `https://m.jingxi.com/jxmc/operservice/Buy?channel=7&sceneid=1001&type=1&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'feed':
      url = `https://m.jingxi.com/jxmc/operservice/Feed?channel=7&sceneid=1001&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'GetEgg':
      url = `https://m.jingxi.com/jxmc/operservice/GetSelfResult?channel=7&sceneid=1001&type=11&itemid=${$.onepetInfo.petid}&_stk=channel%2Citemid%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetEgg`, url);
      break;
    default:
      console.log(`错误${type}`);
  }
  return new Promise(async resolve => {
    $.get(myRequest, (err, resp, data) => {
      try {
        dealReturn(type, data);
      } catch (e) {
        console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function dealReturn(type, data) {
  switch (type) {
    case 'GetHomePageInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.homeInfo = data.data;
      } else {
        console.log(`获取活动信息异常：${JSON.stringify(data)}\n`);
      }
      break;
    case 'mowing':
    case 'jump':
    case 'cow':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.mowingInfo = data.data;
        let add = ($.mowingInfo.addcoins || $.mowingInfo.addcoin) ? ($.mowingInfo.addcoins || $.mowingInfo.addcoin) : 0;
        console.log(`获得金币：${add}`);
        if(Number(add) >0 ){
          $.runFlag = true;
        }else{
          $.runFlag = false;
          console.log(`未获得金币暂停${type}`);
        }
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
    default:
      console.log(JSON.stringify(data));
  }
}

function getGetRequest(type, url) {
  const method = `GET`;
  let headers = {
    'Origin': `https://st.jingxi.com`,
    'Cookie': $.cookie,
    'Connection': `keep-alive`,
    'Accept': `application/json`,
    'Referer': `https://st.jingxi.com/pingou/jxmc/index.html`,
    'Host': `m.jingxi.com`,
    'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
    'Accept-Encoding': `gzip, deflate, br`,
    'Accept-Language': `zh-cn`
  };
  return {url: url, method: method, headers: headers};
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
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
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
            $.log('京东服务器返回空数据');
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
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
