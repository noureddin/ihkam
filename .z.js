
// copied from my other project: Recite: https://github.com/noureddin/recite

// returns ayat ref in the form sprintf("%03d%03d", sura_num, aaya_num)
const make_audio_list = (sura_bgn, aaya_bgn, sura_end, aaya_end) =>
  range(115).slice(+sura_bgn + 1, +sura_end + 2)
    // s is the sura number, 1-based
    .map(s => range(+sura_length[s - 1] + 1)
      .slice(s === +sura_bgn + 1 ? +aaya_bgn     :   1,
             s === +sura_end + 1 ? +aaya_end + 1 : 300  // larger than any sura
      )
      .map(a => s.toString().padStart(3,'0')
              + a.toString().padStart(3,'0')
      )
    )
    .reduce((list, s) => {  // https://stackoverflow.com/a/38528645
      if (s[0].match(/001$/) &&  // if it's the first aaya of the sura
          !s[0].match(/^001/) && // and it's is not al-faatiha
          !s[0].match(/^009/)    // and it's is not at-tawba
      ) {
        s.unshift('001001')      // add basmala
      }
      list.push(...s)  // flatten
      return list
    }, [])

const MX = 6236
var ayat = Array(MX)
var imla  // plain imlaai, for searching

function load_plain (callback) {
  if (imla) { callback(); return }
  fetch(`res/imlap.lzma`)
    .then((res) => res.ok ? res.arrayBuffer() : null)
    .then((buf) => {
      imla = LZMA.decompress(new Uint8Array(buf)).split('\n').slice(0,-1)
      callback()
    })
}

// both imlaai and uthmani are split into nearly equal-size (in bytes) parts, without crossing suar.
// each of these constants is the aaya that starts that part.
// const P0 = 0
const P1 =  494
const P2 =  955
const P3 = 1474
const P4 = 2141
const P5 = 2933
const P6 = 3789
const P7 = 4736
// const P8 = MX  // past the final part

function load (st, en, callback) {

  const either_between = (a, b) => st >= a && st < b || en >= a && en < b

  // check what parts are needed
  const p0 = st < P1 || en < P1
  const p1 = either_between(P1, P2)
  const p2 = either_between(P2, P3)
  const p3 = either_between(P3, P4)
  const p4 = either_between(P4, P5)
  const p5 = either_between(P5, P6)
  const p6 = either_between(P6, P7)
  const p7 = st >= P7 || en >= P7

  const a = p0 ? 0 :
            p1 ? 1 :
            p2 ? 2 :
            p3 ? 3 :
            p4 ? 4 :
            p5 ? 5 :
            p6 ? 6 :
            p7 ? 7 :
            null

  const b = p7 ? 7 :
            p6 ? 6 :
            p5 ? 5 :
            p4 ? 4 :
            p3 ? 3 :
            p2 ? 2 :
            p1 ? 1 :
            p0 ? 0 :
            null

  console.assert(a != null && b != null, 'load failed to determine parts for:', st, en)

  const parts = [...Array(b-a+1).keys()].map(i => i+a)

  const load_part = (part, start, end, cb) => {
    // check an arbitrary aaya in the given part, then callback or load it then callback
    if (ayat[start]) { cb(); return }
    fetch(`res/u${part}.lzma`)
      .then((res) => res.ok ? res.arrayBuffer() : null)
      .then((buf) => {
        if (ayat[start]) { cb(); return }  // happens when searching
        ayat = [
          ...ayat.slice(0, start && start-1),  // zero if zero (which gives an empty array), subtract one otherwise
          ...LZMA.decompress(new Uint8Array(buf)).split('\n').slice(0,-1),
          ...ayat.slice(end-1),
        ]
        cb()
      })
  }

  const L = [
    (cb) => load_part(0,  0, P1, cb),
    (cb) => load_part(1, P1, P2, cb),
    (cb) => load_part(2, P2, P3, cb),
    (cb) => load_part(3, P3, P4, cb),
    (cb) => load_part(4, P4, P5, cb),
    (cb) => load_part(5, P5, P6, cb),
    (cb) => load_part(6, P6, P7, cb),
    (cb) => load_part(7, P7, MX, cb),
  ]

  const loaded = Array(8)
  const all_loaded = () =>
    parts.reduce((acc, p) => acc && loaded[p], true)

  const cb = (i) => {
    loaded[i] = true
    if (all_loaded()) {
      callback()  // the real, user-provided callback
    }
  }

  for (let i = 0; i < 8; ++i) {
    if (parts.indexOf(i) !== -1) { L[i](() => cb(i)) }
  }

}

