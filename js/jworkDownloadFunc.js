// ==UserScript==
// @name         通用一键打包图片下载
// @namespace    http://tampermonkey.net/
// @version      0.91
// @description  通用快速一键下载专用
// @author       jeef
// @match        https://www.jimeilu.com/
// @icon         https://www.google.com/s2/favicons?domain=telegra.ph
// @require      https://resource.mingdesigner.cn/js/tampermonkey/jindexdbex.js
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        window.jworkDownloadFunc
// ==/UserScript==

(function () {

    'use strict';


    let displayDiv = undefined
    let multiLineLen = 2
    let list = []
    let fileName = "未命名"
    let len = 0
    /** 自制数据库对象 */
    let dbObj
    let op
    let headers

    /** 自动保存大法 */
    function saveAs(blob, name) {
        let a = document.createElement('a')
        let url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = name
        a.click()
    }

    let GM_requestFunc = async (url) => {
        return new Promise((bigRes, bigRej) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                nocache: true,
                onload: function (res) {
                    if (res.status == 200) {
                        var text = res.responseText;
                        bigRes(text)
                    }
                }
            });
        })
    }

    let GM_requestBlobFunc = async (url) => {
        return new Promise((res, rej) => {
            if (headers) {
                GM_xmlhttpRequest({
                    method: "GET", url: url, headers: headers, responseType: "blob", onload: (response) => {
                        res(response.response)
                    }, onerror: () => console.log(filename + "(" + url + ") download failed!")
                });
            }
            else {
                GM_xmlhttpRequest({
                    method: "GET", url: url, responseType: "blob", onload: (response) => {
                        res(response.response)
                    }, onerror: () => console.log(filename + "(" + url + ") download failed!")
                });
            }

        })
    }

    /** 数据库初始化大法 */
    let initDBFunc = async () => {
        dbObj = new JIndexDBEX(op.dbName, 1.0)
        dbObj.onsuccess = (ev) => {
            console.log("数据库初始化成功")
        }
        dbObj.onupgradeneeded = (ev, transaction) => {
            dbObj.createStore(op.dbStoreName, { autoIncrement: true, keyPath: "id" })
            dbObj.getStore(op.dbStoreName, "readwrite", transaction).createIndex("url", "url")
        }
        await dbObj.init()
        return
    }

    /** 通过url快速检测
     * @param url {string} 链接
     */
    let getUrlDataByDBFunc = async (url) => {
        let data = await dbObj.find(op.dbStoreName, url, "url")
        return data?.base64
    }

    /** 
    *@param url {string} 链接
    *@param base64 {string} base64数据
    *@param sort {number} 索引序号 
    */
    let setUrlDataByDBFunc = async (url, base64, sort) => {
        let data = { url, base64, title: op.dbDataTilte | "", sort }
        await dbObj.add(op.dbStoreName, data)
        return
    }

    /** 删除数据库缓存数据,一般用在下载完成删除 */
    let deleteDBFunc = async () => {
        await dbObj.deleteList(op.dbStoreName, undefined, (val) => {
            if (op.list.indexOf(val.url) != -1) {
                return true
            }
            return false
        }, "url")
        return
    }

    /**
 * 
 * blob二进制 to base64
 **/
    async function blobToDataURI(blob) {
        return new Promise((res, rej) => {
            var reader = new FileReader();
            reader.onload = (e) => {
                res(e.target.result)
            }
            reader.readAsDataURL(blob);
        })
    }

    /** 
     * 
     * @param url {string} 注解
     * @param sort {number} 序号
     * @returns {Blob}
     * 
     */
    let fetchFunc = async (url, sort) => {
        let base64 = await getUrlDataByDBFunc(url)
        if (base64) {
            return base64
        }
        let blob = await GM_requestBlobFunc(url)
        base64 = await blobToDataURI(blob)
        await setUrlDataByDBFunc(url, base64, sort)
        return base64
    }


    /** @type {Worker} */
    let work
    async function backMain(cb) {
        if (work) {
            work.terminate()
        }
        let jsStr = await GM_requestFunc("https://resource.mingdesigner.cn/js/tampermonkey/jWorkerDownload_debug.js")
        // console.log(jsStr)
        let blob = new Blob([jsStr], { type: 'text/javascript' })
        let url = URL.createObjectURL(blob)
        work = new Worker(url)
        work.addEventListener("message", (e) => {
            if (!e?.data?.type) {
                return
            }
            switch (e.data.type) {
                case "start":
                    displayDiv.innerHTML = "开始安排下载"
                    work.postMessage({
                        op: op,
                        type: "download"
                    })
                    break
                case "msg":
                    console.log(e.data.msg)
                    displayDiv.innerHTML = e.data.msg
                    break
                case "zip":
                    saveAs(e.data.file, `${fileName}.zip`);
                    work.terminate();//结束进程,以防耗资源
                    if (cb) {
                        cb()
                    }
                    break
            }
        })
    }

    /** 
     * @param {string[]} [list] 注解
     * @param {number} [multi]
     */
    let prevDownloaadFunc = async (list, multi) => {
        if (!multi) {
            multi = 1
        }
        let i = -1
        let doneIndex = 0
        displayDiv.innerHTML = `已经下载${doneIndex}/${list.length}`
        return new Promise(async (res, rej) => {

            let go = async () => {
                multi--
                i++
                await fetchFunc(list[i], i)
                doneIndex++
                displayDiv.innerHTML = `已经下载${doneIndex}/${list.length}`
                if (doneIndex == list.length) {
                    res()
                }
                if (i == list.length - 1) {
                    return
                }
                go()
                return
            }
            for (let i = 0; i < multi; i++) {
                go()
            }
        })
    }

    /** 
     * @param {object} [config]
     * @param {string} config.name 打包名称
     * @param {string[]} config.imgList 图片链接
     * @param {HTMLDivElement} config.div
     * @param {number} config.multi 多线程
     * @param {any} config.headers 提前下载专用
     * @param {boolean} config.isPrevDownload 是否提前下载,为了解决跨域的问题
     * @param {boolean} config.isClose 下载完是否关闭网页
     */
    unsafeWindow.jworkDownloadFunc = async (config) => {

        fileName = config.name
        list = config.imgList
        displayDiv = config.div
        multiLineLen = config.multi
        headers = config.headers
        len = list.length
        op = {
            list: list,
            multiThread: multiLineLen,
            extendName: undefined,
            isRename: true,
            isIndexdb: true,
            dbName: "mydb",
            dbStoreName: "快速一键打包下载",
            dbDataTilte: document.title
        }

        // 解决跨域下载问题
        if (config.isPrevDownload) {
            await initDBFunc()
            // for (let i = 0; i < len; i++) {
            //     let url = list[i]
            //     displayDiv.innerHTML = `正在下载${i + 1}/${len}`
            //     await fetchFunc(url, i)
            // }
            await prevDownloaadFunc(list, multiLineLen)
        }
        backMain(() => {
            if (config.isClose) {
                window.close()
            }
        })
    }

    // Your code here...
})();