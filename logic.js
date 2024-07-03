'use strict'

const p = Qid('p')
const x = Qid('x')
const el_endmsg = Qid('endmsg')

const unmark = (w) => w
  .replace(/\xa0\u06dd[٠-٩]+/, '')
  .replace(/[\u06D6-\u06DC]/, '')

const split = (a) => a.split(/(?:\n|(?<=[\u06D6-\u06DC]))/)

function clear_board () {
  p.innerHTML = ''
  x.innerHTML = ''
  el_teacher_input.disabled = false
}

function recite (ayat, title='') {

  const teacher = el_teacher_input.checked
  el_teacher_input.disabled = true

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
  for (let i = 0; i < final_count; ++i) { mistakes[i] = 0 }

  const done = () => {
    //
    range(final_count).forEach(i => {
      const m = mistakes[i]
      Qid('w'+i).classList.add('m' + (m > 5 ? 'x' : m))
    })
    //
    el_endmsg.hidden = false
    confetti.start(1200, 50, 150)
    show_selectors()
    setTimeout(() => el_ok.focus(), 500)
    p.classList.add('done')
    //
    el_teacher_input.disabled = false
  }

  const real_drop = (idx) => {
    if (idx === 0) { clean_placeholder() }
    const w = Qid('w'+idx)
    w.innerHTML = w.dataset.word
    if (w.dataset.word.match(/\u06dd|\ufdfd/)) { audio.next(); audio.play() }  // if basmala or end of ayah
    w.draggable = false
    p.appendChild(w)
    if (idx === final_count - 1) { done() }
  }

  const drop = (el) => {
    const idx = +el.id.replace(/^w/, '')
    const c = p.children.length
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
      real_drop(c)
    }
    else {
      ++mistakes[c]
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
  shuffle(words.map((e,i) => mkword(e,i))).forEach(e => x.appendChild(e))
  allwords.clear()

}
