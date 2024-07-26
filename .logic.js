
const {
  unmark,
  phrasify,
  repeat_title,
  preview_format,
  preview_put,
  current_idx,
  recite_init,
  recite_done,
  do_drop,
} = aayaat_logic

let int

function clear_board () {
  if (int != null) { clearInterval(int); int = null }
  el_p.hidden = true
  el_x.hidden = true
  el_endmsg.hidden = true
}

function init_board () {
  if (int != null) { clearInterval(int); int = null }
  el_repeat.innerText = 'إعادة'
  el_repeat.title = 'اضغط لإعادة هذا الاختبار من البداية.'
  el_repeat.dataset.goatcounterClick = 'repeat'
  el_reshow.style.display = ''
  el_hb.classList.add('b3')
  //
  el_endmsg.hidden = true
  el_p.innerHTML = ''
  el_x.innerHTML = ''
  el_p.hidden = false
  el_x.hidden = false
}

function preview (content) {
  init_board()
  el_repeat.innerText = 'ابدأ الاختبار'
  el_repeat.title = 'ابدأ في ترتيب ' + repeat_title + '.'
  el_repeat.dataset.goatcounterClick = 'start'
  el_reshow.style.display = 'none'
  el_hb.classList.remove('b3')
  preview_put(content)
}

// WAIT is the time before showing a hint, in millisecond
// SHORT_WAIT is the time before hint of first phrase; should be 1/4 of WAIT
// MAX is the maximum number of phrases to show on one screen
// LIMIT is the maximum number of phrases (< MAX) before splitting into two,
//   shuffled separately; should be odd and ~80% of MAX
const levels = [
  { MAX: 10, LIMIT:  7, WAIT: 20_000, SHORT_WAIT:  5_000 },
  { MAX: 18, LIMIT: 13, WAIT: 40_000, SHORT_WAIT: 10_000 },
  { MAX: 30, LIMIT: 25, WAIT: 60_000, SHORT_WAIT: 15_000 },
  { MAX: 50, LIMIT: 39, WAIT: 90_000, SHORT_WAIT: 22_500 },
  { MAX: 90, LIMIT: 71, WAIT:150_000, SHORT_WAIT: 37_500 },
]

function recite (content, lvl=2) {

  init_board()
  recite_init(content)

  const { MAX, LIMIT, WAIT, SHORT_WAIT } = levels[lvl]

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
    if (Qall('.mh').length) { return }  // if a mistakes hint is shown
    // show hint one minute since last attempt, or 15 seconds since start if haven't played yet
    const n = now_ms()
    const c = current_idx()
    if (n - noplay_since >= WAIT || n - time_start >= SHORT_WAIT && c === 0) {
      Qid('w'+c).classList.add('th')  /* time hint */
      delayed[c] = true
    }
  }, 1000)

  const words = phrasify(content)
  const final_count = words.length

  const mistakes = []
  const delayed = []
  for (let i = 0; i < final_count; ++i) { mistakes[i] = 0; delayed[i] = false }

  const done = () => {
    if (int != null) { clearInterval(int); int = null }
    //
    const seen = new Set()
    //
    range(final_count).forEach(i => {
      const m = mistakes[i]
      const d = delayed[i]
      const cls =
         d && m === 0 && i === 0
                     ? 'df' :
        !d && m <  5 ? 'm'+m :
         d && m <= 1 ? 'd'+m :
                       'mx'
      Qid('w'+i).classList.add(cls)
      seen.add(cls)
    })
    //
    'm0 m1 m2 m3 m4 mx df d0 d1'.split(' ').forEach(cls => {
      Q('#leg .'+cls).parentElement.hidden = !seen.has(cls)
    })
    //
    el_endmsg.hidden = false
    recite_done(content)
    confetti.start(1200, 50, 150)
    show_selectors()
    setTimeout(() => el_ok.focus(), 500)
    el_p.classList.add('done')
  }

  const phrase_mistakes = new Set()  // add, has, clear

  const real_drop = (idx) => {
    phrase_mistakes.clear()
    noplay_since = now_ms()
    Qall('.mh, .th').forEach(e => e.classList.remove('mh', 'th'))  // remove hints
    do_drop(idx)
    if (idx === final_count - 1) { done() } else { next_subset() }
  }

  const drop = (el) => {
    const idx = +el.id.r(/^w/, '')
    const c = current_idx()
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
    else {  // mistake
      if (phrase_mistakes.has(idx)) { return }
      phrase_mistakes.add(idx)  // count multiple clicks on a single wrong phrase a single mistake
      ++mistakes[c]
      if (mistakes[c] >= 5) {  // 5+ mistakes are the same color at the end
        Qid('w'+c).classList.add('mh')  // mistakes hint
      }
    }
  }

  const allwords = new Map()  // set, has, clear
  const identicals = new Map()
  const reidenticals = new Map()

  const mkword = (word, idx) => {
    const w = unmark(word)
    if (allwords.has(w)) {
      const old = identicals.get(w) == null ? [] : identicals.get(w)
      identicals.set(w, new Set([allwords.get(w), ...old, idx]))
      reidenticals.set(allwords.get(w), w)
      reidenticals.set(idx, w)
    }
    else {
      allwords.set(w, idx)
    }
    return make_elem('div', {
      Classes: 'w',
      Dataset: { word },
      innerHTML: w,
      id: 'w'+idx,
      draggable: true,
      ondragstart: (ev) => {
        ev.dataTransfer.setData('text/plain', idx)
        ev.dataTransfer.dropEffect = 'move'
      },
      onclick: (ev) => drop(ev.target),
    })
  }

  const cards = words.map((e,i) => mkword(e,i))
  allwords.clear()

  if (cards.length <= MAX) {
    if (cards.length > LIMIT) {
      const N = Math.trunc(cards.length/2)
      // eg, for 30 (lvl 2): if 26 to 30 cards, put the first half (13 to 15 cards) first, then the second half
      shuffle(cards.splice(0,N)).forEach(e => el_x.appendChild(e))
      shuffle(cards).forEach(e => el_x.appendChild(e))
    }
    else {
      shuffle(cards).forEach(e => el_x.appendChild(e))
    }
    var next_subset = () => {}
  }
  else {
    const N = Math.trunc(MAX/2)
    shuffle(cards.splice(0,N)).forEach(e => el_x.appendChild(e))
    shuffle(cards.splice(0,N)).forEach(e => el_x.appendChild(e))
    const inf = make_elem('div', { id: 'inf', innerHTML: '\u221e' /* infinity */, title: 'ستظهر عبارات أخرى عندما ترتب بعض هذه العبارات.' })
    el_x.appendChild(inf)
    var next_subset = () => {
      if (cards.length && el_x.children.length <= N+1) {  /* +1 for #inf */
        shuffle(cards.splice(0,N)).forEach(e => el_x.appendChild(e))
        cards.length ? el_x.appendChild(inf) /* replace */ : el_x.removeChild(inf)
      }
    }
  }

  el_p.ondragover = (ev) => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'move'
  }
  el_p.ondrop = (ev) => {
    ev.preventDefault()
    drop(Qid('w'+ev.dataTransfer.getData('text/plain')))
  }
}
