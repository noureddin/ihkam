// ligilumi: to parse url parameters
// verso: a verse
// versligilumi: parsing verses (not preferences) url params
//
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
  const en = start_(ensura - 1) + suar_length[ensura - 1]
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
    const max_aaya = suar_length[sura - 1]
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

function _versligilumilo (params) {
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
  params
    .slice(1)  // remove the first character (`?` or `#`)
    .split('&')
    .map(p => p.split('='))
    //.reduce((obj, cur, i) => { i == 0 ? {} : (obj[cur[0]] = cur[1], obj), {})
    .forEach((e, i) => {
      const is_of = (...params) => params.includes(e[0])
           if (is_of('a')) { a = isNaN(+e[1]) ? a : +e[1] }
      else if (is_of('b')) { b = isNaN(+e[1]) ? b : +e[1] }
      else if (is_of('s')) { [st, en] = suras_to_ayat(...range_to_pair(e[1])) || [st, en] }
      else                 { [st, en] =  ayat_to_ayat(...range_to_pair(e[0])) || [st, en] }
    })
  if (st == null || en == null) { return [null, null] }
  st -= b; en += a
  if (st <= 0)    { st = 1    }
  if (en >  6236) { en = 6236 }
  return [st, en]
}

function versligilumi () {
  const [st, en] = _versligilumilo(window.location.hash || window.location.search)
  //
  // if no ayat are selected
  if (st == null || en == null) { return }
  ;[el_sura_bgn.value, el_aaya_bgn.value] = idx2aya(st-1).map((n,i) => i === 0 ? n - 1 : n)
  ;[el_sura_end.value, el_aaya_end.value] = idx2aya(en-1).map((n,i) => i === 0 ? n - 1 : n)
  validate_aaya_sura_input({})  // fix numerals
  start_reciting()
}
