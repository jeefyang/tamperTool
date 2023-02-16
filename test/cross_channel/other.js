// 油猴脚本
// window.close()

let target = document.getElementById("imgDiv")
console.log(target.children.length)
let list = []
for (let i = 0; i < target.children.length; i++) {
    /** @type {HTMLImageElement} 注解 */
    let child = target.children[i]
    console.log(child)
    if (child.getAttribute("src")) {
        list.push(child.getAttribute("src"))
    }
}

let dbName = "corss_channel"
let storeName = "imgList"
let isOK = false
/** 
  * @param {CrossChannel_InitData} [data] 注解
  */
function successCB(data) {
    let child = data.list.find(c => {
        return location.href.indexOf(c.id) != -1
    })
    if (child) {
        child.imgList = list
        child.isDone = true
        isOK = true
        data.isCloseing = true
    }
    console.log(data)
    return data
}
let finishCB = () => {
    if (isOK) {
        window.close()
    }
}
CrossChannelOther({
    dbName, storeName,
    successCB,
    finishCB,
    type: "localStorage",
    localStorageValName: "test",
})
// CrossChannelPostOther({
//     win: window,
//     successCB,
//     finishCB,
//     postUrl:"*"
// })