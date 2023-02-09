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
    let request = window.indexedDB.open(op.dbName, op.version || 1);
    let db;
    let setValFunc = (data) => {
        return new Promise((resolve, rej) => {
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
    request.onsuccess = (event) => {
        db = request.result;
        let trans = db.transaction([op.storeName], "readwrite");
        let store = trans.objectStore(op.storeName);
        let res = store.get(1);
        res.onerror = () => {
            console.warn("无法获取数据库");
            db.close();
        };
        res.onsuccess = (ev) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let valStr = (_a = res === null || res === void 0 ? void 0 : res.result) === null || _a === void 0 ? void 0 : _a.val;
            if (!valStr) {
                console.warn("无法获取数据库");
                db.close();
                return;
            }
            let val = JSON.parse(valStr);
            let newVal = op.successCB(val);
            yield setValFunc(newVal);
            console.log("打完收工");
            db.close();
            if (op.finishCB) {
                op.finishCB();
            }
        });
    };
}
