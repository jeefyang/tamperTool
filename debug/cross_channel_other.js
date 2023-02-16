var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** 跨域交流副逻辑 */
function CrossChannelOther(op) {
    let request;
    let db;
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
                let val = valStr ? JSON.parse(valStr) : undefined;
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
        request.onsuccess = (event) => __awaiter(this, void 0, void 0, function* () {
            db = request.result;
            let val = yield getIndexedDBValFunc();
            let newVal = op.successCB(val);
            if (newVal) {
                yield SetIndexedDBValFunc(newVal);
            }
            db.close();
            if (op.finishCB) {
                op.finishCB();
            }
        });
    }
    else {
        let val = getLocalStorageValFunc();
        let newVal = op.successCB(val);
        if (newVal) {
            setLocalStorageValFunc(newVal);
        }
        if (op.finishCB) {
            op.finishCB();
        }
    }
}
