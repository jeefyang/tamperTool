function CrossChannelPostOther<T>(op: {
    /** 当前窗口对象 */
    win: Window,
    /** 发生请求的链接 */
    postUrl: string,
    /** 加载成功回调 */
    successCB: (data: T) => T
    /** 最后完成回调 */
    finishCB?: () => void
}) {
    op.win.addEventListener("message", (e) => {
        console.log("接收数据")
        let str = e.data
        let data: T = JSON.parse(str)
        let newData = op.successCB(data)
        if (newData) {
            let newDataStr = JSON.stringify(newData)
            op.win.postMessage(newDataStr, op.postUrl)
        }
        if (op.finishCB) {
            op.finishCB()
        }
    })
}