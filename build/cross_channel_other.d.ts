/** 跨域交流副逻辑 */
declare function CrossChannelOther<T>(op: {
    /** 库名 */
    dbName: string;
    /** 表名 */
    storeName: string;
    /** 版本 */
    version?: number;
    /** 加载成功回调 */
    successCB: (data: T) => T;
    /** 最后完成回调 */
    finishCB?: () => void;
}): void;
