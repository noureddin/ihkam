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
}

function recite (ayat, title='') {

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
  }

  const drop = (el) => {
    const idx = +el.id.replace(/^w/, '')
    const c = p.children.length
    if (idx !== c) { ++mistakes[c]; return }
    if (c === 0) { clean_placeholder() }
    const w = Qid('w'+idx)
    w.innerHTML = w.dataset.word
    w.draggable = false
    p.appendChild(w)
    if (c === final_count - 1) { done() }
  }

  const mkword = (word, idx) => {
    const el = document.createElement('div')
    el.innerHTML = unmark(word)
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

  shuffle(words.map((e,i) => mkword(e,i))).forEach(e => x.appendChild(e))

}
