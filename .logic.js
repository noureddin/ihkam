'use strict'

const p = Qid('p')
const x = Qid('x')
const el_endmsg = Qid('endmsg')

const unmark = (phrase) => phrase
  // remove mosħaf formatting signs
  .r(/\xa0\u06dd[٠-٩]+(?:\xa0\u06e9)?/, '')  // ayah number & sajda if any
  .r(/\u06de\xa0/,       '')   // start of rub el hizb if found
  .r(/[\u06D6-\u06DC] /, '')   // waqf signs
  .r(/\u0305/g,          '')   // combining overline
  .r(/^(.)\u0651/g,      '$1') // initial shadda-of-idgham
  // remove final tashkeel signs (except shadda)
  .r(/[\u06e4-\u06e6]+$/g,   '')    // madd-monfasel & madd sela
  .r(/\u06e1$/,              '')    // jazm (quranic sukun)
  .r(/[\u064e-\u0650]$/,     '')    // fatha, damma, kasra
  .r(/[\u064c\u064d]$/,      '')    // tanween {damm, kasr}
  .r(/[\u08f1\u08f2]$/,      '')    // open tanween {damm, kasr}
  .r(/\u064f\u06e2$/,        '')    // iqlab tanween damm
  .r(/\u0650\u06ed$/,        '')    // iqlab tanween kasr
  .r(/\u064b([اى]?)$/,       '$1')  // tanween fath
  .r(/\u08f0([اى]?)$/,       '$1')  // open tanween fath
  .r(/\u064e\u06e2([اى]?)$/, '$1')  // iqlab tanween fath
  .r(/\u064e([اى]?)$/,       '$1')  // just fath, before final alef (either kind), because of tanween (eg, إذا)
  .r(/(ى)\u0670$/,           '$1')  // dagger alef from final alef maqsura (its existence depends on the first letter of the next word)

const split = (a) => a.split(/(?:\n|(?<=[\u06D6-\u06DC] ))/)

let int

function clear_board () {
  if (int != null) { clearInterval(int); int = null }
  p.hidden = true
  x.hidden = true
  el_endmsg.hidden = true
}

// WAIT is the time before showing a hint, in millisecond
// SHORT_WAIT is the time before hint of first phrase; should be 1/4 of WAIT
// MAX is the maximum number of phrases to show on one screen
// LIMIT is the maximum number of phrases (< MAX) before splitting into two, shuffled separately; should be odd and ~80% of MAX
const levels = [
  { MAX: 10, LIMIT:  7, WAIT: 20_000, SHORT_WAIT:  5_000 },
  { MAX: 18, LIMIT: 13, WAIT: 40_000, SHORT_WAIT: 10_000 },
  { MAX: 30, LIMIT: 25, WAIT: 60_000, SHORT_WAIT: 15_000 },
  { MAX: 50, LIMIT: 39, WAIT: 90_000, SHORT_WAIT: 22_500 },
  { MAX: 90, LIMIT: 71, WAIT:150_000, SHORT_WAIT: 37_500 },
]

function recite (ayat, title='', lvl=2) {

  const { MAX, LIMIT, WAIT, SHORT_WAIT } = levels[lvl]

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
    if (Qall('.mh').length) { return }  // if a mistakes hint is shown
    // show hint one minute since last attempt, or 15 seconds since start if haven't played yet
    const n = now_ms()
    const c = current()
    if (n - noplay_since >= WAIT || n - time_start >= SHORT_WAIT && c === 0) {
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

  const w = ayat.map(e => e.r(/[A-Z<>]/g, ''))

  const words = w.flatMap(e => split(e))
  const final_count = words.length

  const mistakes = []
  const delayed = []
  for (let i = 0; i < final_count; ++i) { mistakes[i] = 0; delayed[i] = false }

  const done = () => {
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
    confetti.start(1200, 50, 150)
    show_selectors()
    setTimeout(() => el_ok.focus(), 500)
    p.classList.add('done')
  }

  const phrase_mistakes = new Set()  // add, has, clear

  const real_drop = (idx) => {
    phrase_mistakes.clear()
    noplay_since = now_ms()
    Qall('.mh, .th').forEach(e => e.classList.remove('mh', 'th'))  // remove hints
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
    const idx = +el.id.r(/^w/, '')
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
      identicals.set(w, new Set([allwords.get(w), ...(identicals.get(w) ?? []), idx]))
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
      shuffle(cards.splice(0,N)).forEach(e => x.appendChild(e))
      shuffle(cards).forEach(e => x.appendChild(e))
    }
    else {
      shuffle(cards).forEach(e => x.appendChild(e))
    }
    var next_subset = () => {}
  }
  else {
    const N = Math.trunc(MAX/2)
    shuffle(cards.splice(0,N)).forEach(e => x.appendChild(e))
    shuffle(cards.splice(0,N)).forEach(e => x.appendChild(e))
    const inf = make_elem('div', { id: 'inf', innerHTML: '\u221e' /* infinity */, title: 'ستظهر عبارات أخرى عندما ترتب بعض هذه العبارات.' })
    x.appendChild(inf)
    var next_subset = () => {
      if (cards.length && x.children.length <= N+1) {  /* +1 for #inf */
        shuffle(cards.splice(0,N)).forEach(e => x.appendChild(e))
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
