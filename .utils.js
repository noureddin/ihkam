
function Q    (selector) { return document.querySelector(selector) }
function Qall (selector) { return document.querySelectorAll(selector) }
function Qid  (id)       { return document.getElementById(id) }

Element.prototype.Q    = Element.prototype.querySelector
Element.prototype.Qall = Element.prototype.querySelectorAll
// Element.prototype.Qid  = Element.prototype.getElementById

const now_ms = () => (new Date()).getTime()  // unix epoch in ms

const range = (n) => n ? [...Array(n).keys()] : []

const mathrandom = Math.random  // to be minified

// shorthand
String.prototype.r = String.prototype.replace

const B = document.body
const S = localStorage


// DOM-related

const hide_el = (el) => { el.style.visibility = 'hidden';  el.style.opacity = '0' }
const show_el = (el) => { el.style.visibility = 'visible'; el.style.opacity = '1' }

function make_elem (tag, opts={}) {
  const el = document.createElement(tag)
  for (let opt in opts)
    if (opt === 'Classes')
      el.classList.add(...opts.Classes.split(/\s+/))
    else if (opt === 'Dataset')
      for (let k in opts.Dataset)
        el.dataset[k] = opts.Dataset[k]
    else
      el[opt] = opts[opt]
  return el
}

function make_svgelem (tag, attrs={}, opts={}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag)
  for (let attr in attrs)
    el.setAttribute(attr, attrs[attr])
  return el
}

// Fisher-Yates (aka Knuth) Shuffle
// https://stackoverflow.com/a/2450976
function shuffle (arr) {
  let curIdx = arr.length
  let randIdx
  // While there remain elements to shuffle...
  while (curIdx != 0) {
    // Pick a remaining element...
    randIdx = Math.floor(mathrandom() * curIdx)
    curIdx--
    // And swap it with the current element.
    [arr[curIdx], arr[randIdx]] = [arr[randIdx], arr[curIdx]]
  }
  return arr
}

