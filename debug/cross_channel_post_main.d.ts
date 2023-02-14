declare function CrossChannelPostMain<T>(op: {
    /** 当前窗口对象 */
    win: Window;
    /** 初始化数据 */
    initData?: T;
    /** 发生请求的链接 */
    postUrl: string;
    /** 轮询时间 */
    rollTime?: number;
    /** 轮询回调,如果带有数据,则会触发数据写入数据库操作 */
    rollCB: (data: T) => boolean | {
        val: T;
        c: boolean;
    };
    /** 轮询结束回调 */
    rollFinish: (data: T) => void;
}): void;
