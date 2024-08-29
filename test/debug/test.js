// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://127.0.0.1:8080/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=0.1
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    let GM_requestFunc = async (url) => {
        return new Promise((bigRes, bigRej) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                nocache: true,
                onload: function (res) {
                    if (res.status == 200) {
                        var text = res.responseText;
                        bigRes(text)
                    }
                }
            });
        })
    }

    // let work

    let int = 100

    // Your code here...
})();