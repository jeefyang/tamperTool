// 普通脚本
/** @type {HTMLButtonElement} 注解 */
let btn = document.getElementById("btn")
btn.addEventListener("click", () => {
  // let myWin = window.open("./other.html")
})




// 油猴脚本
btn.addEventListener("click", () => {
  /** @type {HTMLButtonElement} 注解 */
  let btn = document.getElementById("btn")
  /** @type {CrossChannel_InitData} 注解 */
  let initData = {
    list: [],
    isCloseing: false
  }
  let tableList = document.getElementsByTagName("table")
  let aList = tableList[0].getElementsByTagName("a")
  console.log(tableList)
  for (let i = 0; i < aList.length; i++) {
    initData.list.push({ id: aList[i].href, imgList: [], isDone: false })
  }
  console.log(initData)
  // return

  /** 
   * @param {CrossChannel_InitData} [data] 注解
   */
  let rollFunc = (data) => {
    if (!data.isCloseing) {
      return false
    }
    let isNoDone = false
    /** @type {string} 注解 */
    let noDoneID
    for (let i = 0; i < data.list.length; i++) {
      let c = data.list[i]
      if (!noDoneID && !c.isDone) {
        noDoneID = c.id
      }
      if (c.isDone) {
        console.log(c.imgList)
        if (!c.isAppendImg) {
          let tr = document.createElement("tr")
          for (let j = 0; j < c.imgList.length; j++) {
            let img = document.createElement("img")
            img.src = c.imgList[j]
            img.setAttribute("width", "100px")
            img.setAttribute("height", "auto")
            tr.append(img)
          }
          let parent = aList[i].parentElement.parentElement
          parent.parentElement.insertBefore(tr, parent)
          c.isAppendImg = true
        }

      }
      isNoDone = isNoDone || !c.isDone
    }
    console.log(noDoneID)
    if (noDoneID) {
      for (let i = 0; i < aList.length; i++) {
        if (noDoneID.indexOf(aList[i].href) != -1) {
          document.body.focus()
          aList[i].click()
          break
        }
      }
    }
    data.isCloseing = false
    return { c: !isNoDone, val: data }
  }
  initData.list[0][""]
  CrossChannelMain({
    dbName: "corss_channel",
    storeName: "imgList",
    initData: initData,
    rollTime: 1000,
    rollCB: rollFunc,
    type: "localStorage",
    localStorageValName: "test",
    isFinishClear: true,
    rollFinish: (data) => {
      console.log(data)
      console.log("完成")
    },
  })
  // setTimeout(() => {
  //   CrossChannelPostMain({
  //     win:window,
  //     rollTime: 1000,
  //     initData,
  //     rollCB: rollFunc,
  //     rollFinish: () => {
  //       console.log("完成")
  //     },
  //     postUrl:"*"
  //   })
  // }, 2000);
  aList[0].click()
});