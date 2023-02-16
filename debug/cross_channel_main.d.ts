/** 跨域交流主逻辑
 * 原理为将交互的数据以字符串形式保存在一条数据理,操控这个字符串数据改变以作出任意修改,所以尽可能不要放置大数据,不然解析字符串会很耗时间
 */
declare function CrossChannelMain<T>(op: {
    /** 库名 */
    dbName?: string;
    /** 表名 */
    storeName?: string;
    /** 版本 */
    version?: number;
    /** 初始化数据 */
    initData?: T;
    /** 轮询时间 */
    rollTime: number;
    /** 轮询回调,如果带有数据,则会触发数据写入数据库操作 */
    rollCB: (data: T) => boolean | {
        val: T;
        c: boolean;
    };
    /** 轮询结束回调 */
    rollFinish: (data: T) => void;
    /** 完成后是否清除数据 */
    isFinishClear?: boolean;
    /** 最大轮询 */
    maxRoll: number;
    /** 是否不初始化数据 */
    isNoInit?: boolean;
    /** 存储类型 */
    type: "indexedDB" | "localStorage" | "GM";
    /** 本地存储名 */
    localStorageValName?: string;
}): void;
