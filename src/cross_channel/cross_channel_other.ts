/** 跨域交流副逻辑 */
function CrossChannelOther<T>(
    op: {
        /** 库名 */
        dbName: string
        /** 表名 */
        storeName: string
        /** 版本 */
        version?: number
        /** 加载成功回调 */
        successCB: (data: T) => T
        /** 最后完成回调 */
        finishCB?: () => void
    }
) {
    let request = window.indexedDB.open(op.dbName, op.version || 1)
    let db: IDBDatabase
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
    request.onsuccess = (event) => {
        db = request.result
        let trans = db.transaction([op.storeName], "readwrite")
        let store = trans.objectStore(op.storeName)
        let res = store.get(1)
        res.onerror = () => {
            console.warn("无法获取数据库")
            db.close()
        }
        res.onsuccess = async (ev) => {
            let valStr = res?.result?.val
            if (!valStr) {
                console.warn("无法获取数据库")
                db.close()
                return
            }
            let val: T = JSON.parse(valStr)
            let newVal = op.successCB(val)
            await setValFunc(newVal)
            console.log("打完收工")
            db.close()
            if (op.finishCB) {
                op.finishCB()
            }
        }
    }
}

