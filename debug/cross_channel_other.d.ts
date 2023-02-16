/** 跨域交流副逻辑 */
declare function CrossChannelOther<T>(op: {
    /** 库名 */
    dbName?: string;
    /** 表名 */
    storeName?: string;
    /** 版本 */
    version?: number;
    /** 加载成功回调,如果返回undefined,数据不会进一步保存 */
    successCB: (data: T) => T;
    /** 最后完成回调 */
    finishCB?: () => void;
    /** 存储类型 */
    type: "indexedDB" | "localStorage" | "GM";
    /** 本地存储名 */
    localStorageValName?: string;
}): void;
