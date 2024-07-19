// ligilumi: parsing url parameters

// from my other project Recite: https://github.com/noureddin/recite/

const MAX_AYA  = 6236
const MAX_SURA = 114

function is_number (x) {
  return x == null ? x : !!x.match(/^[0-9]+$/)
}

function __paired (pair, sep) {  // auxiliary function for is_valid_pair
  const elems = pair.split(sep)
  return elems.length === 2 && elems.every(is_number)
}

function is_valid_pair (x) {  // a number, empty string, or two numbers separated by slash or double-slash
  return x === '' || is_number(x) || __paired(x, '//') || __paired(x, '/')
}

function range_to_pair (x) {
  if (x === '') { return [null, null] }
  let xs = x.split('-')
  if (xs.length === 1 && xs.every(is_valid_pair)) { return [x, x] }
  if (xs.length === 2 && xs.every(is_valid_pair)) { return  xs    }
  return [null, null]
}

function suras_to_ayat (stsura, ensura) {  // each is 1-114
  if (stsura === '') { stsura =   '1' }
  if (ensura === '') { ensura = '114' }
  if (!is_number(stsura) || !is_number(ensura)) { return }
  stsura = +stsura || 1
  ensura = +ensura || MAX_SURA
  if (stsura < 1        || ensura < 1       ) { return }
  if (stsura > MAX_SURA || ensura > MAX_SURA) { return }
  const st = start_(stsura - 1) + 1
  const en = start_(ensura - 1) + sura_length[ensura - 1]
  return [st, en]
}

function idx2aya (idx) {  // 0-6235
  if (idx < 0 || idx > 6236) { return [null, null] }
  const s = [...Array(114).keys()].find(s => idx >= start_(s) && idx < start_(s + 1))
  return [s + 1, idx - start_(s) + 1]
}


function _aya2idx (aya) {  // 1-6236 or 1/7
  if (aya.includes('/')) {
    let a = aya.split('/');
    if (a.length !== 2) { return }
    // neither can be negative because of the earlier range_to_pair's split('-')
    const [sura, aaya] = [ +a[0], +a[1] ]
    if (isNaN(sura) || isNaN(aaya)) { return }
    if (sura < 1 || sura > MAX_SURA) { return }
    const max_aaya = sura_length[sura - 1]
    const clamped_aaya = Math.max(1, Math.min(max_aaya, aaya))
    // that clamps the aaya number to the valid range,
    // so zero is the first aaya, and 300 is the last aaya in the sura.
    return start_(sura - 1) + clamped_aaya
  }
  else {
    if (+aya > MAX_AYA) { return }
    return +aya
  }
}

function ayat_to_ayat (staya, enaya) {  // each is 1-6236 or 1/7 (sura/aya)
  if (!staya) { return }
  let st = _aya2idx(staya)
  let en = _aya2idx(enaya)
  if (st == null || en == null) { return }
  st = +st || 1; en = +en || MAX_AYA
  return [st, en]
}

function _ligilumilo (params) {
  let st; let en  // start aaya and end aaya
  // possible params:
  // - s: sura, an entire sura. 1-114.
  // - j: juz,  an entire juz.  1-30.
  // - ### => number of aaya in the Quran (1-6236)
  // - ##/### => number of sura and number of aaya in it
  //
  // all previous parameters can be paired; e.g., s=1-2 means the first two suar
  //
  let a = 0; let b = 0
  // - b: before, a number of ayat to add before whatever you select. 0-inf.
  // - a: after,  a number of ayat to add before whatever you select. 0-inf.
  //
  let l  // level: 0 (beginner) to 4 (impossible)
  params
    .slice(1)  // remove the first character (`?` or `#`)
    .split('&')
    .map(p => p.split('='))
    //.reduce((obj, cur, i) => { i == 0 ? {} : (obj[cur[0]] = cur[1], obj), {})
    .forEach((e, i) => {
      const is_of = (...params) => params.includes(e[0])
           if (is_of('a')) { a = isNaN(+e[1]) ? a : +e[1] }
      else if (is_of('b')) { b = isNaN(+e[1]) ? b : +e[1] }
      else if (is_of('l')) { const v = +e[1]; if (!isNaN(v) && v >= 0 && v < 5) { l = v } }
      else if (is_of('s')) { [st, en] = suras_to_ayat(...range_to_pair(e[1])) || [st, en] }
      else                 { [st, en] =  ayat_to_ayat(...range_to_pair(e[0])) || [st, en] }
    })
  if (st == null || en == null) { return [null, null, l] }
  st -= b; en += a
  if (st <= 0)    { st = 1    }
  if (en >  6236) { en = 6236 }
  return [st, en, l]
}

function ligilumi () {
  const [st, en, lvl] = _ligilumilo(window.location.hash || window.location.search)
  //
  if (lvl != null) { Qid('l'+lvl).checked = true }
  // if no ayat are selected
  if (st == null || en == null) { return }
  const stpair = idx2aya(st-1)
  const enpair = idx2aya(en-1)
  el_sura_bgn.value = stpair[0]-1
  el_sura_end.value = enpair[0]-1
  set_aayaat(el_aaya_bgn, sura_bgn_length(), stpair[1])
  set_aayaat(el_aaya_end, sura_end_length(), enpair[1])
  start_reciting()
}
