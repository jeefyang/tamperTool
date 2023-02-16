/** 跨域交流副逻辑 */
function CrossChannelOther<T>(
    op: {
        /** 库名 */
        dbName?: string
        /** 表名 */
        storeName?: string
        /** 版本 */
        version?: number
        /** 加载成功回调,如果返回undefined,数据不会进一步保存 */
        successCB: (data: T) => T
        /** 最后完成回调 */
        finishCB?: () => void,
        /** 存储类型 */
        type: "indexedDB" | "localStorage" | "GM"
        /** 本地存储名 */
        localStorageValName?: string
    }
) {
    let request: IDBOpenDBRequest
    let db: IDBDatabase
    let getLocalStorageValFunc = (): T => {
        let dataStr: string
        if (op.type == "localStorage") {
            dataStr = localStorage.getItem(op.localStorageValName)
        }
        else if (op.type == "GM") {
            dataStr = GM_getValue(op.localStorageValName)
        }
        if (dataStr) {
            return <T>JSON.parse(dataStr)
        }
        console.warn("接口不对")
        return undefined
    }

    let setLocalStorageValFunc = (val: T) => {
        if (op.type == "localStorage") {
            return localStorage.setItem(op.localStorageValName, val ? JSON.stringify(val) : "")
        }
        else if (op.type == "GM") {
            return GM_setValue(op.localStorageValName, val ? JSON.stringify(val) : "")
        }
        console.warn("接口不对")
        return
    }
    /** 获取大法,indexedDB专用 */
    let getIndexedDBValFunc = (): Promise<T> => {
        return new Promise((resolve, rej) => {
            if (op.type != 'indexedDB') {
                console.warn("接口不对")
                rej()
            }
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
                let val: T = valStr ? JSON.parse(valStr) : undefined
                resolve(val)
            }
        })
    }

    /** 设置大法,indexedDB专用 */
    let SetIndexedDBValFunc = (data: T): Promise<any> => {
        return new Promise((resolve, rej) => {
            if (op.type != 'indexedDB') {
                console.warn("接口不对")
                rej()
            }
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

    if (op.type == "indexedDB") {
        request = window.indexedDB.open(op.dbName, op.version || 1)
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
        request.onsuccess = async (event) => {
            db = request.result
            let val = await getIndexedDBValFunc()
            let newVal = op.successCB(val)
            if (newVal) {
                await SetIndexedDBValFunc(newVal)
            }
            db.close()
            if (op.finishCB) {
                op.finishCB()
            }
        }
    }
    else {
        let val = getLocalStorageValFunc()
        let newVal = op.successCB(val)
        if (newVal) {
            setLocalStorageValFunc(newVal)
        }
        if (op.finishCB) {
            op.finishCB()
        }
    }

}

