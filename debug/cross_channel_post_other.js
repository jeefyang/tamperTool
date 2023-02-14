function CrossChannelPostOther(op) {
    op.win.addEventListener("message", (e) => {
        console.log("接收数据");
        let str = e.data;
        let data = JSON.parse(str);
        let newData = op.successCB(data);
        if (newData) {
            let newDataStr = JSON.stringify(newData);
            op.win.postMessage(newDataStr, op.postUrl);
        }
        if (op.finishCB) {
            op.finishCB();
        }
    });
}
