// ==UserScript==
// @name         通用爬虫
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  通用快速一键爬虫
// @author       jeef
// @match        https://www.wnflb2023.com/forum-2-1.html
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {

    'use strict';

    /** 
     * @param {object} [config] 配置
     * @param {"main"|"other"} config.type 类型,主页还是副页
     * @param {number} [config.mainRollTime] 主页轮询时间,只有主页才会触发,默认为1000
     * @param {number} [config.mainRollCount] 主页最大轮询次数,用于防止耗光资源,默认为-1,不会触发
     * @param {(data,op)=>void} [config.mainRollCountCB] 耗光最大轮询次数后触发的回调
     * @param {boolean} [config.isMainInit] 数据是否初始化
     * @param {string} config.key 存储的key
     * @param {string} config.opKey 额外配置的key,这个数据用于存储一些内置数据,方便控制整体流程
     * @param {object} config.initData 初始的数据
     * @param {(data,op)=>void|(data,op)=>Promise<any>} [config.mainRollCB] 主页轮询的回调
     * @param {(data,op,cur)=>void|(data,op, cur)=>Promise<any>} [config.mainCB] 主页回调
     * @param {(data,op)=>boolean} config.checkMainFinish 主页是否完成判断
     * @param {(data,op)=>void|(data,op)=>Promise<any>} [config.otherFunc] 副页方法
     * @param {boolean} [config.isOtherFinishClose] 副页完成后是否关闭
     * @param {(data,op)=>boolean} [config.maxRollCB] 超出轮询的回调,默认false为跳过,true为暂停
     * @param {number} [config.mainthread] 主页线程数,默认为1
     */
    unsafeWindow.jworkCrawlerFunc = async (config) => {
        if (!config.key || !config.opKey) {
            alert("没有有效的key值")
            return
        }
        if (!config.initData) {
            alert("缺少初始数据")
            return
        }
        /** 
         * 存储数据
         * @param {object} data 存储的数据
         */
        let setDataFunc = (data) => {
            let str = JSON.stringify(data)
            GM_setValue(config.key, str)
        }

        /** 
         * 获取数据
         */
        let getDataFunc = () => {
            let str = GM_getValue(config.key)
            if (!str) {
                setDataFunc(config.initData)
                str = GM_getValue(config.key)
            }
            return JSON.parse(str)
        }

        /** 设置配置的数据 */
        let setOPFunc = (data) => {
            let str = JSON.stringify(data)
            GM_setValue(config.opKey, str)
        }

        /**
         * 获取配置的数据 
         * @returns {{callList:{url:string,isFinish:boolean,maxRoll:number,isOver:boolean}[],isPause:boolean,isComplete:boolean,isLoop:boolean}}
         */
        let getOPFunc = () => {
            let str = GM_getValue(config.opKey)
            return JSON.parse(str)
        }

        // 如果没有数据就初始化一下数据
        getDataFunc()
        // 副页
        if (config.type == "other") {
            let data = getDataFunc()
            let op = getOPFunc()
            if (!op) {
                return
            }
            let callData = op.callList.find(o => window.location.href.indexOf(o.url) != -1)
            if (!callData || callData.isFinish) {
                return
            }
            await config.otherFunc(data, op)
            op = getOPFunc()
            callData = op.callList.find(o => window.location.href.indexOf(o.url) != -1)
            if (callData) {
                callData.isFinish = true
                setOPFunc(op)
            }
            if (config.isOtherFinishClose) {
                window.close()
            }
            return
        }
        // 主页是不是需要初始化数据
        if (config.type == "main" && config.isMainInit) {
            setDataFunc(config.initData)
        }
        if (config.type == "main") {
            let maxRoll = config.mainRollCount
            /** 
             * @param {ReturnType<getOPFunc>} op
             */
            let oneRollFunc = async (data, op) => {
                config.mainCB && await config.mainCB(data, op)
                return
            }

            /**
             * 
             * @param {*} data 
             * @param {ReturnType<getOPFunc>} op 
             */
            let rollFunc = async (data, op) => {
                if (op.isLoop) {
                    console.warn("死循环")
                    return
                }
                if (op.isPause) {
                    console.warn("暂停")
                    return
                }
                if (op.isComplete) {
                    console.log("完成了!!!")
                    return
                }
                let isNoting = true
                for (let i = op.callList.length - 1; i >= 0; i--) {
                    let callData = op.callList[i]
                    if (callData.isOver) {
                        continue
                    }
                    if (callData.isFinish) {
                        await config.mainCB(data, op, callData)
                        op.callList.splice(i, 1)
                        setDataFunc(data)
                        setOPFunc(op)
                        continue
                    }
                    isNoting = false
                    if (!callData.maxRoll) {
                        console.warn(`${callData.url} 超出轮询次数退出`)
                        let check = config?.maxRollCB?.(data, op) || false
                        if (!check) {
                            callData.isOver = true
                        }
                        else {
                            op.isPause = true
                        }
                        setDataFunc(data)
                        setOPFunc(op)
                        continue
                    }
                    callData.maxRoll--
                }
                if (isNoting) {
                    op.isLoop = true
                    console.warn("死循环")
                    return
                }
                config.mainRollCB && await config.mainRollCB(data, op)
                setDataFunc(data)
                setOPFunc(op)
                setTimeout(async () => {
                    rollFunc()
                }, config.mainRollTime || 1000);
                
            }
        }

    }

    // Your code here...
})();