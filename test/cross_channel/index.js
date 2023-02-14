// 普通脚本
/** @type {HTMLButtonElement} 注解 */
let btn = document.getElementById("btn")
btn.addEventListener("click", () => {
  let myWin = window.open("./other.html")
})




// 油猴脚本
btn.addEventListener("click", () => {
  /** @type {HTMLButtonElement} 注解 */
  let btn = document.getElementById("btn")
  console.log(btn)
  /** @type {CrossChannel_InitData} 注解 */
  let initData = {
    list: [{ id: "xx", imgList: [], isDone: false }]
  }
  /** 
   * @param {CrossChannel_InitData} [data] 注解
   */
  let rollFunc = (data) => {
    let isNoDone = false
    for (let i = 0; i < data.list.length; i++) {
      let c = data.list[i]
      console.log(c.imgList)
      isNoDone = isNoDone || !c.isDone
    }
    return !isNoDone
  }
  initData.list[0][""]
  // CrossChannelMain({
  //   dbName: "corss_channel",
  //   storeName: "imgList",
  //   initData: initData,
  //   rollTime: 1000,
  //   rollCB: rollFunc,
  //   rollFinish: () => {
  //     console.log("完成")
  //   },
  // })
  setTimeout(() => {
    CrossChannelPostMain({
      win:window,
      rollTime: 1000,
      initData,
      rollCB: rollFunc,
      rollFinish: () => {
        console.log("完成")
      },
      postUrl:"*"
    })
  }, 2000);
  
});