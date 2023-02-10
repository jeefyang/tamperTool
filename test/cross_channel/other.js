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
/** 
  * @param {CrossChannel_InitData} [data] 注解
  */
function successCB(data) {
    data.list[0].imgList = list
    data.list[0].isDone = true
    return data
}
let finishCB = () => {
    window.close()
}
CrossChannelOther({
    dbName, storeName,
    successCB,
    finishCB
})