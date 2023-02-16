var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** 跨域交流主逻辑
 * 原理为将交互的数据以字符串形式保存在一条数据理,操控这个字符串数据改变以作出任意修改,所以尽可能不要放置大数据,不然解析字符串会很耗时间
 */
function CrossChannelMain(op) {
    if (op.maxRoll == undefined) {
        op.maxRoll = -1;
    }
    let request;
    let db;
    /** 获取本地存储大法 */
    let getLocalStorageValFunc = () => {
        let dataStr;
        if (op.type == "localStorage") {
            dataStr = localStorage.getItem(op.localStorageValName);
        }
        else if (op.type == "GM") {
            dataStr = GM_getValue(op.localStorageValName);
        }
        if (dataStr) {
            return JSON.parse(dataStr);
        }
        console.warn("接口不对");
        return undefined;
    };
    /** 设置本地存储大法 */
    let setLocalStorageValFunc = (val) => {
        if (op.type == "localStorage") {
            return localStorage.setItem(op.localStorageValName, val ? JSON.stringify(val) : "");
        }
        else if (op.type == "GM") {
            return GM_setValue(op.localStorageValName, val ? JSON.stringify(val) : "");
        }
        console.warn("接口不对");
        return;
    };
    /** 异步清空大法,indexedDB专用 */
    let clearIndexedDBFunc = () => {
        return new Promise((resolve, rej) => {
            if (op.type != 'indexedDB') {
                console.warn("接口不对");
                rej();
            }
            let trans = db.transaction([op.storeName], "readwrite");
            let store = trans.objectStore(op.storeName);
            let res = store.clear();
            res.onerror = () => {
                console.warn("清空失败");
                db.close();
                rej();
            };
            res.onsuccess = () => {
                console.log("清空成功");
                resolve(undefined);
            };
        });
    };
    /** 异步初始化大法,,indexedDB专用 */
    let initIndexedDBFunc = () => {
        return new Promise((resolve, rej) => {
            if (op.type != 'indexedDB') {
                console.warn("接口不对");
                rej();
            }
            let trans = db.transaction([op.storeName], "readwrite");
            let store = trans.objectStore(op.storeName);
            console.log(JSON.stringify(op.initData));
            let res = store.add({ val: JSON.stringify(op.initData), id: 1 });
            res.onerror = () => {
                console.warn("数据初始化失败");
                db.close();
                rej();
            };
            res.onsuccess = () => {
                console.log("数据初始化成功");
                resolve(undefined);
            };
        });
    };
    /** 完成大法 */
    let finishFunc = () => {
        if (db) {
            db.close();
        }
        console.log("完成捕捉");
    };
    /** 获取大法,indexedDB专用 */
    let getIndexedDBValFunc = () => {
        return new Promise((resolve, rej) => {
            if (op.type != 'indexedDB') {
                console.warn("接口不对");
                rej();
            }
            let trans = db.transaction([op.storeName]);
            let store = trans.objectStore(op.storeName);
            let res = store.get(1);
            res.onerror = () => {
                console.warn("数据获取失败");
                db.close();
                rej();
            };
            res.onsuccess = () => {
                var _a;
                console.log("数据获取成功");
                let valStr = (_a = res === null || res === void 0 ? void 0 : res.result) === null || _a === void 0 ? void 0 : _a.val;
                if (!valStr) {
                    console.warn("数据解析失败");
                    db.close();
                    rej();
                }
                let val = JSON.parse(valStr);
                resolve(val);
            };
        });
    };
    /** 设置大法,indexedDB专用 */
    let SetIndexedDBValFunc = (data) => {
        return new Promise((resolve, rej) => {
            if (op.type != 'indexedDB') {
                console.warn("接口不对");
                rej();
            }
            let trans = db.transaction([op.storeName], "readwrite");
            let store = trans.objectStore(op.storeName);
            let res = store.put({ val: JSON.stringify(data), id: 1 });
            res.onerror = () => {
                console.warn("数据写入失败");
                db.close();
                rej();
            };
            res.onsuccess = () => {
                console.log("数据写入成功");
                resolve(undefined);
            };
        });
    };
    /** 异步一次轮询大法,indexedDB专用 */
    let OneRollIndexedDBFunc = () => __awaiter(this, void 0, void 0, function* () {
        if (op.type != 'indexedDB') {
            console.warn("接口不对");
            throw ("接口不对");
        }
        let val = yield getIndexedDBValFunc();
        let data = op.rollCB(val);
        if (typeof data == "boolean") {
            return { val: val, c: data };
        }
        else {
            yield SetIndexedDBValFunc(data.val);
            return { val: data.val, c: data.c };
        }
    });
    /** 一次轮询大法 */
    let oneRollLocalStorageFunc = () => {
        let val = getLocalStorageValFunc();
        let data = op.rollCB(val);
        if (typeof data == "boolean") {
            return { val: val, c: data };
        }
        else {
            setLocalStorageValFunc(data.val);
            return { val: data.val, c: data.c };
        }
    };
    /** 轮询大法 */
    let rollFunc = () => {
        if (!op.maxRoll) {
            console.warn("超出轮询次数退出");
            op.rollFinish(undefined);
            finishFunc();
            if (op.isFinishClear) {
                if (op.type == "indexedDB") {
                    clearIndexedDBFunc();
                }
                else {
                    setLocalStorageValFunc(undefined);
                }
            }
            return;
        }
        setTimeout(() => {
            if (op.type == "indexedDB") {
                OneRollIndexedDBFunc().then(o => {
                    if (o.c) {
                        op.rollFinish(o.val);
                        finishFunc();
                        if (op.isFinishClear) {
                            clearIndexedDBFunc();
                        }
                    }
                    else {
                        op.maxRoll--;
                        rollFunc();
                    }
                });
            }
            else {
                let o = oneRollLocalStorageFunc();
                if (o.c) {
                    op.rollFinish(o.val);
                    finishFunc();
                    if (op.isFinishClear) {
                        setLocalStorageValFunc(undefined);
                    }
                }
                else {
                    op.maxRoll--;
                    rollFunc();
                }
            }
        }, op.rollTime);
    };
    if (op.type == "indexedDB") {
        request = window.indexedDB.open(op.dbName, op.version || 1);
        request.onupgradeneeded = (event) => {
            db = request.result;
            if (!db.objectStoreNames.contains(op.storeName)) {
                // 创建存储库
                db.createObjectStore(op.storeName, { keyPath: "id", autoIncrement: true });
            }
        };
        request.onerror = (event) => {
            console.warn(event);
        };
        request.onsuccess = (ev) => __awaiter(this, void 0, void 0, function* () {
            db = request.result;
            if (!op.isNoInit) {
                yield clearIndexedDBFunc();
                yield initIndexedDBFunc();
            }
            rollFunc();
        });
    }
    else {
        if (!op.isNoInit) {
            setLocalStorageValFunc(op.initData);
        }
        rollFunc();
    }
}
