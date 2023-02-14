function CrossChannelPostMain(op) {
    op.win.addEventListener("message", (e) => {
        console.log("接收数据", e);
        let str = e.data;
        let data = JSON.parse(str);
        let res = op.rollCB(data);
        let func = () => {
            if (typeof res == "boolean") {
                if (res) {
                    op.rollFinish(data);
                }
                else {
                    let dataStr = JSON.stringify(data);
                    console.log("发送数据");
                    op.win.postMessage(dataStr, op.postUrl);
                }
                return;
            }
            else {
                if (res.c) {
                    op.rollFinish(res.val);
                }
                else {
                    let dataStr = JSON.stringify(res.val);
                    console.log("发送数据");
                    op.win.postMessage(dataStr, op.postUrl);
                }
            }
        };
        if (op.rollTime) {
            setTimeout(() => {
                func();
            }, op.rollTime);
        }
        else {
            func();
        }
    });
    if (op.initData) {
        let dataStr = JSON.stringify(op.initData);
        op.win.postMessage(dataStr, op.postUrl);
    }
}
