'use strict'

function Q    (selector) { return document.querySelector(selector) }
function Qall (selector) { return document.querySelectorAll(selector) }
function Qid  (id)       { return document.getElementById(id) }

const now_ms = () => (new Date()).getTime()  // unix epoch in ms

const range = (n) => n ? [...Array(n).keys()] : []

// shorthand
String.prototype.r = String.prototype.replace

// Fisher-Yates (aka Knuth) Shuffle
// https://stackoverflow.com/a/2450976
function shuffle (arr) {
  let curIdx = arr.length
  let randIdx
  // While there remain elements to shuffle...
  while (curIdx != 0) {
    // Pick a remaining element...
    randIdx = Math.floor(Math.random() * curIdx)
    curIdx--
    // And swap it with the current element.
    [arr[curIdx], arr[randIdx]] = [arr[randIdx], arr[curIdx]]
  }
  return arr
}

