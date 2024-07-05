'use strict'

const p = Qid('p')
const x = Qid('x')
const el_endmsg = Qid('endmsg')

const unmark = (w) => w
  .replace(/\u06de\xa0/, '')
  .replace(/\xa0\u06dd[٠-٩]+(?:\xa0\u06e9)?/, '')
  .replace(/[\u06D6-\u06DC] /, ' ')
  .replace(/\u0305/g, '')  // overline

const split = (a) => a.split(/(?:\n|(?<=[\u06D6-\u06DC] ))/)

let int

function clear_board () {
  if (int != null) { clearInterval(int); int = null }
  p.hidden = true
  x.hidden = true
  el_endmsg.hidden = true
}

function recite (ayat, title='') {

  const current = () => p.children.length

  let time_start = now_ms()
  let noplay_since = now_ms()
  let away = false  // a good assumption, only breaks when auto-starting with the url params
  let away_since = Infinity
  window.onblur = () => {
    away = true
    away_since = now_ms()
  }
  window.onfocus = () => {
    away = false
    if (away_since === Infinity) {  // if the started without being focused
      time_start = now_ms()
    }
    else {
      const away_dur = now_ms() - away_since
      time_start += away_dur
    }
  }

  // const duration = () => now_ms() - time_start

  if (int != null) { clearInterval(int) }

  int = setInterval(() => {
    if (away) { return }
    // show hint one minute since last attempt, or 15 seconds since start if haven't played yet
    const n = now_ms()
    const c = current()
    if (n - noplay_since >= 60_000 || n - time_start >= 15_000 && c === 0) {
      Qid('w'+c).classList.add('th')  /* time hint */
      delayed[c] = true
    }
  }, 1000)

  const teacher = el_teacher_input.checked

  el_endmsg.hidden = true
  x.innerHTML = ''
  p.hidden = false
  x.hidden = false

  p.style.color = 'gray'
  p.style.textAlign = 'center'
  p.innerText = title
  const clean_placeholder = () => {
    p.style.color = ''
    p.style.textAlign = ''
    p.innerText = ''
  }

  const w = ayat.map(e => e.replace(/[A-Z<>]/g, ''))

  const words = w.flatMap(e => split(e))
  const final_count = words.length

  const mistakes = []
  const delayed = []
  for (let i = 0; i < final_count; ++i) { mistakes[i] = 0; delayed[i] = false }

  const done = () => {
    //
    range(final_count).forEach(i => {
      const m = mistakes[i]
      const d = delayed[i]
      Qid('w'+i).classList.add(
        !d && m <  5 ? 'm'+m :
         d && m <= 1 ? 'd'+m :
                       'mx'
      )
    })
    //
    el_endmsg.hidden = false
    confetti.start(1200, 50, 150)
    show_selectors()
    setTimeout(() => el_ok.focus(), 500)
    p.classList.add('done')
  }

  const real_drop = (idx) => {
    if (idx === 0) { clean_placeholder() }
    const w = Qid('w'+idx)
    w.innerHTML = w.dataset.word
    if (w.dataset.word.match(/\u06dd|\ufdfd/)) { audio.next(); audio.play() }  // if basmala or end of ayah
    w.draggable = false
    w.classList.remove('hint')
    p.append('\u200b', w)  // zero width space, to allow a phrase to start on the next line, without additional spacing
    if (idx === final_count - 1) { done() } else { next_subset() }
  }

  const drop = (el) => {
    noplay_since = now_ms()
    Qall('.mh, .th').forEach(e => e.classList.remove('mh', 'th'))  // remove hints
    const idx = +el.id.replace(/^w/, '')
    const c = current()
    if (idx === c) {
      real_drop(c)
    }
    else if (reidenticals.has(c) && reidenticals.has(idx) && reidenticals.get(c) === reidenticals.get(idx)) {  // identical phrases
      // swap c & idx then drop
      const a = Qid('w'+c)
      const b = Qid('w'+idx)
      a.id += 'x'
      b.id = 'w'+c
      a.id = 'w'+idx
      const other = a.dataset.word
      a.dataset.word = b.dataset.word
      b.dataset.word = other
      real_drop(c)
    }
    else {
      ++mistakes[c]
      if (mistakes[c] >= 5) {  // 5+ mistakes are the same color at the end
        Qid('w'+c).classList.add('mh')  // mistakes hint
      }
    }
  }

  const allwords = new Map()  // set, has
  const identicals = new Map()
  const reidenticals = new Map()

  const mkword = (word, idx) => {
    const el = document.createElement('div')
    const w = unmark(word)
    if (allwords.has(w)) {
      identicals.set(w, new Set([allwords.get(w), ...(identicals.get(w) ?? []), idx]))
      reidenticals.set(allwords.get(w), w)
      reidenticals.set(idx, w)
    }
    else {
      allwords.set(w, idx)
    }
    el.innerHTML = w
    el.id = 'w'+idx
    el.classList.add('w')
    el.draggable = true
    el.dataset.word = word
    el.ondragstart = (ev) => {
      ev.dataTransfer.setData('text/plain', idx)
      ev.dataTransfer.dropEffect = 'move'
    }
    el.onclick = (ev) => drop(el)
    return el
  }


  const cards = words.map((e,i) => mkword(e,i))
  allwords.clear()

  if (cards.length <= 30) {
    if (cards.length > 25) {
      // if 26 to 30 cards, put the first half (13 to 15 cards) first, then the second half
      shuffle(cards.splice(0,Math.trunc(cards.length/2))).forEach(e => x.appendChild(e))
      shuffle(cards).forEach(e => x.appendChild(e))
    }
    else {
      shuffle(cards).forEach(e => x.appendChild(e))
    }
    var next_subset = () => {}
  }
  else {
    shuffle(cards.splice(0,15)).forEach(e => x.appendChild(e))
    shuffle(cards.splice(0,15)).forEach(e => x.appendChild(e))
    const inf = (() => {
      const el = document.createElement('div')
      el.innerHTML = '\u221e' /* infinity */
      el.id = 'inf'
      el.title = 'ستظهر عبارات أخرى عندما ترتب بعض هذه العبارات.'
      return el
    })()
    x.appendChild(inf)
    var next_subset = () => {
      if (cards.length && x.children.length <= 15+1) {  /* +1 for #inf */
        shuffle(cards.splice(0,15)).forEach(e => x.appendChild(e))
        cards.length ? x.appendChild(inf) /* replace */ : x.removeChild(inf)
      }
    }
  }

  p.ondragover = (ev) => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'move'
  }
  p.ondrop = (ev) => {
    ev.preventDefault()
    drop(Qid('w'+ev.dataTransfer.getData('text/plain')))
  }

  audio.set_index(teacher ? 0 : -1)
  if (teacher) { audio.play(0) }

}
