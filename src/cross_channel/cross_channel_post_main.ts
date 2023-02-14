function CrossChannelPostMain<T>(op: {
    /** 当前窗口对象 */
    win: Window
    /** 初始化数据 */
    initData?: T
    /** 发生请求的链接 */
    postUrl: string,
    /** 轮询时间 */
    rollTime?: number
    /** 轮询回调,如果带有数据,则会触发数据写入数据库操作 */
    rollCB: (data: T) => boolean | { val: T, c: boolean }
    /** 轮询结束回调 */
    rollFinish: (data: T) => void
}) {
    op.win.addEventListener("message", (e) => {
        console.log("接收数据",e)
        let str: string = e.data
        let data: T = JSON.parse(str)
        let res = op.rollCB(data)
        let func = () => {
            if (typeof res == "boolean") {
                if (res) {
                    op.rollFinish(data)
                }
                else {
                    let dataStr = JSON.stringify(data)
                    console.log("发送数据")
                    op.win.postMessage(dataStr, op.postUrl)
                }
                return
            }
            else {
                if (res.c) {
                    op.rollFinish(res.val)
                }
                else {
                    let dataStr = JSON.stringify(res.val)
                    console.log("发送数据")
                    op.win.postMessage(dataStr, op.postUrl)
                }
            }
        }
        if (op.rollTime) {
            setTimeout(() => {
                func()
            }, op.rollTime);
        }
        else {
            func()
        }
    })
    if (op.initData) {
        let dataStr = JSON.stringify(op.initData)
        op.win.postMessage(dataStr, op.postUrl)
    }
}