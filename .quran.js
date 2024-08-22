const aayaat_logic = (function () {

const unmark = (phrase) => phrase
  // remove mosħaf formatting signs
  .r(/\xa0\u06dd[٠-٩]+(?:\xa0\u06e9)?/, '')  // ayah number & sajda if any
  .r(/\u06de\xa0/,           '')    // start of rub el hizb if found
  .r(/[\u06D6-\u06DC] /,     '')    // waqf signs
  .r(/\u0305/g,              '')    // combining overline
  .r(/^(.)\u0651/g,          '$1')  // initial shadda-of-idgham
  // remove final tashkeel signs (except shadda)
  .r(/[\u06e4-\u06e6]+$/g,   '')    // madd-monfasel & madd sela
  .r(/\u06e1$/,              '')    // jazm (quranic sukun)
  .r(/[\u064e-\u0650]$/,     '')    // fatha, damma, kasra
  .r(/[\u064c\u064d]$/,      '')    // tanween {damm, kasr}
  .r(/[\u08f1\u08f2]$/,      '')    // open tanween {damm, kasr}
  .r(/\u064f\u06e2$/,        '')    // iqlab tanween damm
  .r(/\u0650\u06ed$/,        '')    // iqlab tanween kasr
  .r(/\u06e2$/,              '')    // iqlab on final noon
  .r(/(ا)\u06df$/,           '$1')  // remove rounded zero from final alef
  .r(/(ى)\u0670$/,           '$1')  // remove dagger alef from final alef maqsura
      // (its existence depends on the first letter of the next word)
  .r(/\u064b([اى]?)$/,       '$1')  // tanween fath
  .r(/\u08f0([اى]?)$/,       '$1')  // open tanween fath
  .r(/\u064e\u06e2([اى]?)$/, '$1')  // iqlab tanween fath
  .r(/\u064e([اى]?)$/,       '$1')  // just fath, before final alef (either kind), because of tanween (eg, إذا)
  .r(/\u06e4(ا)$/,           '$1')  // madd before the final silent alef after waw

function phrasify ([ title, aayaat ]) {
  // equiv. to: return ayat.flatMap(a => a.split(/(?<=[\u06D6-\u06DC] |\n)/))
  // but supports older-ish browsers that don't have flatMap nor lookbehind
  // (that "\n" is for the added basmala before the beginning of almost all suar)
  const ret = []
  const arr = aayaat.map(a => a.replace(/([\u06D6-\u06DC] |\n)/g, '$1X').split('X'))
  for (let i = 0; i < arr.length; ++i) { ret.push(...arr[i]) }
  return ret
}

const set_placeholder = (title) => {
  el_p.style.color = 'gray'
  el_p.style.textAlign = 'center'
  el_p.innerText = title
}

const clear_placeholder = () => {
  el_p.style.color = ''
  el_p.style.textAlign = ''
  el_p.innerText = ''
}

const repeat_title = 'عبارات الآيات'
const preview_format = (a) => a.join(' ')
  .r(/\ufdfd\n/g, '<center>\ufdfd</center>')  // center basmala (but not in al-fateha)
  .r(/(\u06dd٧٥) (\u06de\xa0بَرَاۤءَةࣱ)/, '$1\n$2')  // if previewing sura 8 and sura 9, add a line break between them (b/c there is no basmala)
const preview_put = ([ title, a ]) => {
  clear_placeholder()
  el_p.append(make_elem('p', { id: 't', innerHTML: preview_format(a) }))
}

const current_idx = () => el_p.children.length

const recite_init = ([ title, aayaat ]) => {
  set_placeholder(title)
  //
  const teacher = el_teacher_input.checked
  audio.set_index(teacher ? 0 : -1)
  if (teacher) { audio.play(0) }
}

const do_drop = (idx) => {
  const w = Qid('w'+idx)
  if (idx === 0) { clear_placeholder() }
  const word = w.dataset.word
  w.innerHTML = word
  if (word.match(/\u06dd|\ufdfd/)) { audio.next(); audio.play() }  // if basmala or end of ayah
  w.draggable = false
  w.classList.remove('hint')
  if (word === '\ufdfd\n') {  // basmala: center it on a line by its own (but not in al-fateha)
    const center = make_elem('center')
    center.append(w)
    el_p.appendChild(center)
  }
  else {
    el_p.append(
      word.startsWith('\u06de\xa0بَ') && idx >= 1  // start of sura 9 after sura 8?
      ? '\n'       // force a line break between the end of sura 8 and the beginning of sura 9, in place of the non-existent basmala.
      : '\u200b',  // zero width space, to allow a phrase to start on the next line, without additional spacing
      w)
  }
}


const recite_done = () => {}

return {
  unmark,
  phrasify,
  repeat_title,
  preview_format,
  preview_put,
  current_idx,
  recite_init,
  recite_done,
  do_drop,
}

})()
