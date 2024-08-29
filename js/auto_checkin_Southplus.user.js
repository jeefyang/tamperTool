// ==UserScript==
// @name         南+自动跳转签到
// @namespace    http://tampermonkey.net/
// @version      2024-08-30
// @description  try to take over the world!
// @author       jeef
// @match        http://*/*
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';
    let url = location.href
    /** @type {string} 保存的数据 */
    let key = "southplus_day_checkin"
    /** @type {string} 识别关键路径 */
    let hostTarget = "south-plus.net"
    /** @type {string} 跳转路径 */
    let jumpHostUrl = "https://south-plus.net/index.php"
    /** @type {string} 跳转提示,如果为空,则直接跳转 */
    let jumpWarnning = "即将跳转南+自动签到!"
    /** @type {number} 延迟 */
    let delayTime = 2000
    let finishMsg = "签到完成"
    /** @type {{urlInclude:string,domListCB:()=>HTMLElement[],domCheckCB:(e:HTMLElement)=>boolean,domDoCB:(e:HTMLElement)=>boolean,lastCB?:()=>void}[]} 注解 */
    let objList = [
        {
            urlInclude: 'index.php',
            domListCB: () => document.getElementsByTagName("a"),
            domCheckCB: (e) => e.innerHTML == "社区论坛任务",
            domDoCB: (e) => { e.click(); return true }
        },
        {
            urlInclude: 'plugin.php?H_name-tasks.html',
            domListCB: () => document.getElementsByTagName("a"),
            domCheckCB: (e) => e.title == "按这申请此任务",
            domDoCB: (e) => { e.click(); return true },
            lastCB: () => {
                let alist = document.getElementsByTagName("a")
                for (let i = 0; i < alist.length; i++) {
                    let a = alist[i]
                    if (a.innerHTML != "进行中任务") {
                        continue
                    }
                    a.click()
                    break
                }
            }
        },
        {
            urlInclude: "plugin.php?H_name-tasks-actions-newtasks.html.html",
            domListCB: () => document.getElementsByTagName("a"),
            domCheckCB: (e) => e.title == "领取此奖励",
            domDoCB: (e) => { e.click(); return true }
        }
    ]

    /** 
     * 获取天数
     * @param {number} [n] 毫秒数
     */
    let getDayFunc = (n) => {
        if (!n) {
            n = (new Date()).getTime()
        }
        return Math.floor(n / (1000 * 60 * 60 * 24))
    }

    let v = GM_getValue(key)
    if (v) {
        let day = Number(v)
        console.log("签到天数为:", day)
        let curday = getDayFunc()
        console.log("当前天数为:", curday)
        if (curday - day < 1) {
            console.log("天数差少于1,任务不触发!")
            return
        }
    }

    if (url.indexOf(hostTarget) == -1) {
        console.log("当前不是签到网址,即将跳转")
        console.log(jumpHostUrl)
        setTimeout(() => {
            let c = !jumpWarnning || confirm(`${jumpWarnning}\n${jumpHostUrl}\n可能会被当前网址阻拦`)
            if (c) {
                window.open(jumpHostUrl)
            }
            else {
                c = confirm(`${jumpHostUrl}\n是要跳过今天签到吗?`)
                if (c) {
                    GM.setValue(key, getDayFunc().toString())
                    console.log('已经跳过今天签到')
                }
            }
            return
        }, delayTime);
        return
    }

    /** 
     * @param {string} urlInclude 路径包含
     * @param {()=>HTMLElement[]} domListCB 获取dom元素方法
     * @param {(e:HTMLElement)=>boolean} domCheckCB dom元素判断,boolean判断为是否跳过
     * @param {(e:HTMLElement)=>boolean} domDoCB dom元素操作,操作完成后同个boolean判断是否退出循环
     * @param {()=>void} lastCB 最后dom元素操作,可以为空
     * @param {number} 延迟时间
     */
    let checkPageFunc = async (urlInclude, domListCB, domCheckCB, domDoCB, lastCB = null, time = 0) => {
        if (url.indexOf(urlInclude) == -1) {
            return
        }
        console.log(`识别到:${urlInclude}`)
        let domList = domListCB()
        for (let i = 0; i < domList.length; i++) {
            let a = domList[i]
            if (!domCheckCB(a)) {
                continue
            }
            console.log("抓到元素:")
            console.log(a)
            let check = await new Promise((res) => {
                setTimeout(() => {
                    let check = domDoCB(a)
                    res(check)
                }, time);
            })
            if (check) {
                break
            }
        }
        if (lastCB) {
            await new Promise(res => {
                setTimeout(() => {
                    lastCB()
                }, time);
            })
        }

        return
    }

    let doFunc = async () => {
        console.log("自动签到执行")
        for (let i = 0; i < objList.length; i++) {
            let o = objList[i]
            await checkPageFunc(o.urlInclude, o.domListCB, o.domCheckCB, o.domDoCB, o.lastCB || null, delayTime)
        }
    }


    doFunc()
    GM.setValue(key, getDayFunc().toString())
    console.log("执行任务完成")
    finishMsg && alert(finishMsg)

    // Your code here...
})();