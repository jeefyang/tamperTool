declare function CrossChannelPostOther<T>(op: {
    /** 当前窗口对象 */
    win: Window;
    /** 发生请求的链接 */
    postUrl: string;
    /** 加载成功回调 */
    successCB: (data: T) => T;
    /** 最后完成回调 */
    finishCB?: () => void;
}): void;
