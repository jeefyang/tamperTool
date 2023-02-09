/** 跨域交流主逻辑
 * 原理为将交互的数据以字符串形式保存在一条数据理,操控这个字符串数据改变以作出任意修改,所以尽可能不要放置大数据,不然解析字符串会很耗时间
 */
function CrossChannelMain<T>(
    op: {
        /** 库名 */
        dbName: string
        /** 表名 */
        storeName: string
        /** 版本 */
        version?: number
        /** 初始化数据 */
        initData?: T
        /** 轮询时间 */
        rollTime: number
        /** 轮询回调,如果带有数据,则会触发数据写入数据库操作 */
        rollCB: (data: T) => boolean | { val: T, c: boolean }
        /** 轮询结束回调 */
        rollFinish: (data: T) => void
        /** 最大轮询 */
        maxRoll: number
    }
) {
    if (op.maxRoll == undefined) {
        op.maxRoll = -1
    }
    let request = window.indexedDB.open(op.dbName, op.version || 1)
    let db: IDBDatabase
    request.onupgradeneeded = (event) => {
        db = request.result
        if (!db.objectStoreNames.contains(op.storeName)) {
            // 创建存储库
            db.createObjectStore(op.storeName, { keyPath: "id", autoIncrement: true })
        }
    }
    request.onerror = (event) => {
        console.warn(event)
    }
    request.onsuccess = async (ev) => {
        db = request.result
        await clearFunc()
        await initFunc()
        rollFunc()

    }
    /** 清空大法 */
    let clearFunc = () => {
        return new Promise((resolve, rej) => {
            let trans = db.transaction([op.storeName], "readwrite")
            let store = trans.objectStore(op.storeName)
            let res = store.clear()
            res.onerror = () => {
                console.warn("清空失败")
                db.close()
                rej()
            }
            res.onsuccess = () => {
                console.log("清空成功")
                resolve(undefined)
            }
        })
    }

    /** 初始化大法 */
    let initFunc = () => {
        return new Promise((resolve, rej) => {
            let trans = db.transaction([op.storeName], "readwrite")
            let store = trans.objectStore(op.storeName)
            console.log(JSON.stringify(op.initData))
            let res = store.add({ val: JSON.stringify(op.initData),id:1 })
            res.onerror = () => {
                console.warn("数据初始化失败")
                db.close()
                rej()
            }
            res.onsuccess = () => {
                console.log("数据初始化成功")
                resolve(undefined)
            }
        })
    }

    /** 完成大法 */
    let finishFunc = () => {
        if (db) {
            db.close()
        }
        console.log("完成捕捉")
    }

    let getValFunc = (): Promise<T> => {
        return new Promise((resolve, rej) => {
            let trans = db.transaction([op.storeName])
            let store = trans.objectStore(op.storeName)
            let res = store.get(1)
            res.onerror = () => {
                console.warn("数据获取失败")
                db.close()
                rej()
            }
            res.onsuccess = () => {
                console.log("数据获取成功")
                let valStr = res?.result?.val
                if (!valStr) {
                    console.warn("数据解析失败")
                    db.close()
                    rej()
                }
                let val: T = JSON.parse(valStr)
                resolve(val)
            }
        })
    }

    let setValFunc = (data: T): Promise<any> => {
        return new Promise((resolve, rej) => {
            let trans = db.transaction([op.storeName], "readwrite")
            let store = trans.objectStore(op.storeName)
            let res = store.put({ val: JSON.stringify(data), id: 1 })
            res.onerror = () => {
                console.warn("数据写入失败")
                db.close()
                rej()
            }
            res.onsuccess = () => {
                console.log("数据写入成功")
                resolve(undefined)
            }
        })
    }

    /** 一次轮询大法 */
    let oneRollFunc = async (): Promise<{ val: T, c: boolean }> => {
        let val = await getValFunc()
        let data = op.rollCB(val)
        if (typeof data == "boolean") {
            return { val: val, c: data }
        }
        else {
            await setValFunc(data.val)
            return { val: data.val, c: data.c }
        }
    }

    /** 轮询大法 */
    let rollFunc = () => {
        if (!op.maxRoll) {
            console.warn("超出轮询次数退出")
            op.rollFinish(undefined)
            finishFunc()
            return
        }
        setTimeout(() => {
            oneRollFunc().then(o => {
                if (o.c) {
                    op.rollFinish(o.val)
                    finishFunc()
                }
                else {
                    op.maxRoll--
                    console.log("xx")
                    rollFunc()
                }
            })
        }, op.rollTime);
    }
}