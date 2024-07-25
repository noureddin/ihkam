
// copied from my other project: Recite: https://github.com/noureddin/recite

const spinner = make_svgelem('svg', { id: 'spinner-svg', viewBox: '-50 -50 100 100' })
spinner.appendChild(make_svgelem('circle', { id: 'spinner', cx: 0, cy: 0, r: 35, fill: 'none', 'stroke-width': '10', 'stroke-dasharray': '40 30' }))

const sura_length = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
const sura_name = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس',]
function start_ (s) { return +sura_length.slice(0, s).reduce((a, b) => a + b, 0) }
const sura_offset = range(115).map(start_)  // array mapping 0-based suar to how many ayat before it (eg 0 => 0, 1 => 7, 2 => 286+7)
function sura_of (a) { return range(115).find((i) => sura_offset[i] >= a) }  // takes 1-based aaya ∈ [1-6236], returns its 1-based sura

// tr num & fields()
// TODO see: https://stackoverflow.com/q/10726638

const toarab = (n) =>  // remove non-numerals and convert numerals to Eastern Arabic
  n.toString()
      .replace(/[0٠]/g, '٠')
      .replace(/[1١]/g, '١')
      .replace(/[2٢]/g, '٢')
      .replace(/[3٣]/g, '٣')
      .replace(/[4٤]/g, '٤')
      .replace(/[5٥]/g, '٥')
      .replace(/[6٦]/g, '٦')
      .replace(/[7٧]/g, '٧')
      .replace(/[8٨]/g, '٨')
      .replace(/[9٩]/g, '٩')
      .replace(/[^٠١٢٣٤٥٦٧٨٩]/g, '')

const toascii = (n) =>  // convert numerals to ASCII
  n
      .replace(/٠/g, '0')
      .replace(/١/g, '1')
      .replace(/٢/g, '2')
      .replace(/٣/g, '3')
      .replace(/٤/g, '4')
      .replace(/٥/g, '5')
      .replace(/٦/g, '6')
      .replace(/٧/g, '7')
      .replace(/٨/g, '8')
      .replace(/٩/g, '9')

const sura_bgn_length = () => el_sura_bgn.value === '' ? 0  : sura_length[+el_sura_bgn.value]
const sura_end_length = () => el_sura_end.value === '' ? 0  : sura_length[+el_sura_end.value]
const sura_bgn_val    = () => el_sura_bgn.value === '' ? '' :             +el_sura_bgn.value
const sura_end_val    = () => el_sura_end.value === '' ? '' :             +el_sura_end.value
const aaya_bgn_val    = () => el_aaya_bgn.value === '' ? '' :     +toascii(el_aaya_bgn.value)
const aaya_end_val    = () => el_aaya_end.value === '' ? '' :     +toascii(el_aaya_end.value)

const level_val = () => { for (let i = 0; i < 5; ++i) { if (Qid('l'+i).checked) { return i } } return 2 }

const make_aayaat = (len) => range(len).map(a => `<option value="${a+1}">${toarab(a+1)}</option>`).join('')
const set_aayaat = (el, len, v) => {
  const oldval = aaya_bgn_val()
  el.innerHTML = make_aayaat(len)
  if (v) { el.value = v } else { el.value = len }
}

// validate_aaya_sura_input
// called oninput and onblur with the element; only called for {sura,aaya}_{bgn,end} inputs.
// may update the input fields.
function validate_aaya_sura_input (ev) {
  const el = ev.target
  const blur = ev.type === 'blur'
  const is_aaya = el === el_aaya_bgn || el === el_aaya_end
  //
  // if the changed field is sura_bgn
  if (!blur && el === el_sura_bgn) {
    set_aayaat(el_aaya_bgn, sura_bgn_length(), 1)
    if (sura_end_val() < sura_bgn_val()) {
      el_sura_end.value = sura_bgn_val()
      set_aayaat(el_aaya_end, sura_end_length())
    }
  }
  // if the changed field is sura_end
  else if (!blur && el === el_sura_end) {
    set_aayaat(el_aaya_end, sura_end_length())
    if (sura_end_val() < sura_bgn_val()) {
      el_sura_bgn.value = sura_end_val()
      set_aayaat(el_aaya_bgn, sura_bgn_length(), 1)
    }
  }
}
//

function valid_inputs (sura_bgn, aaya_bgn, sura_end, aaya_end) {  // {{{
  return (
    sura_bgn !== '' && aaya_bgn !== '' &&
    sura_end !== '' && aaya_end !== '' &&
    sura_bgn <= sura_end &&
    (aaya_bgn <= aaya_end || sura_bgn < sura_end) &&
    1 <= aaya_bgn && aaya_bgn <= sura_length[sura_bgn] &&
    1 <= aaya_end && aaya_end <= sura_length[sura_end]
  )
}

function input_trigger_x (ev) {
  // this fn is connected to onkeyup and onmouseup

  const id = ev.target.id
  const key = ev.key

  const on_ayat = id === 'aaya_bgn' || id === 'aaya_end'
  const on_suar = id === 'sura_bgn' || id === 'sura_end'

  // Enter on suar/ayat selection: set focus on the next element:
  //   sura_bgn > aaya_bgn > sura_end > aaya_end > ok
  // also, on the last element, get the next (ie first) word
  if (key === 'Enter' && (on_ayat || on_suar)) {
    (id === 'sura_bgn' ? el_aaya_bgn :
     id === 'aaya_bgn' ? el_sura_end :
     id === 'sura_end' ? el_aaya_end :
     id === 'aaya_end' ? el_ok       :
     1).focus()
    return
  }
}

function init_inputs () {
  // suar
  const sura_options = sura_name.map((t, i) => `<option value="${i}">${t}</option>`).join('')
  el_sura_bgn.innerHTML = el_sura_end.innerHTML = sura_options
  el_sura_sx.innerHTML = '<option value="">كل السور</option>' + sura_options
  // aayaat
  el_aaya_bgn.innerHTML = el_aaya_end.innerHTML = make_aayaat(sura_length[0])
  el_aaya_end.value   = sura_length[0]
  el_aaya_bgn.value   = 1
  el_sura_bgn.value   = el_sura_end.value   = 0
  // suar/aayaat essential interactivity
  el_sura_bgn.oninput = el_aaya_bgn.oninput = el_sura_end.oninput = el_aaya_end.oninput = validate_aaya_sura_input
  el_sura_bgn.onblur  = el_aaya_bgn.onblur  = el_sura_end.onblur  = el_aaya_end.onblur  = validate_aaya_sura_input
  el_sura_bgn.onkeyup = el_aaya_bgn.onkeyup = el_sura_end.onkeyup = el_aaya_end.onkeyup = input_trigger_x
  // support keyboard searching the aayaat fields with ASCII numerals
  let k = '', t = 0
  el_aaya_bgn.onkeydown = el_aaya_end.onkeydown = (ev) => {
    if (ev.key.match(/[0-9]/)) {
      const now = (new Date).getTime()
      now - t < 500
        ? (k += ev.key, t = now)
        : (k  = ev.key, t = now)
      const len = +ev.target.lastChild.value
      if (k >= 1 && k <= len) {
        ev.target.value = k
      }
      else if (ev.key >= 1 && ev.key <= len) {
        ev.target.value = k = ev.key
        t = now
      }
    }
  }
  // searching
  Qall('.search').forEach(el => el.onclick = ({ target }) => {
    if (target.tagName === 'SPAN') { target = target.parentElement }
    const el_aaya = target.previousElementSibling
    const el_sura = el_aaya.previousElementSibling.previousElementSibling  // skip label
    show_search(el_sura, el_aaya)
  })
}

const hide_selectors = function () {
  el_allselectors.hidden = true
  //
  el_header.hidden = false
}

const show_selectors = function () {
  validate_aaya_sura_input({})  // filters inputs & disables/enables ok button
  //
  el_allselectors.hidden = false
  //
  el_header.hidden = true
}

function accept_selectors (audio) {
  const [SA, AA] = [sura_bgn_val(), aaya_bgn_val()]
  const [SZ, AZ] = [sura_end_val(), aaya_end_val()]
  if (!valid_inputs(SA, AA, SZ, AZ)) { return }
  const st = sura_offset[SA] + AA
  const en = sura_offset[SZ] + AZ
  const title = 'عبارات ' + make_title(+SA+1, +AA, +SZ+1, +AZ)
  hide_selectors()
  x.innerHTML = ''; x.append(spinner); x.hidden = false
  if (audio) { init_audio(+SA+1, +AA, +SZ+1, +AZ, el_qaris.value) }
  return [st, en, title]
}

function start_reciting () {
  const [st, en, title] = accept_selectors(/* audio: */ true)
  const lvl = level_val()
  el_title.innerText = 'رتب ' + title
  load(st, en, () => recite([ 'اضغط بالترتيب على ' + title, ayat.slice(st-1, en).map(a => a.replace(/#/, '\ufdfd\n')) ], lvl))
}

function show_first () {
  const [st, en, title] = accept_selectors()
  // TODO: audio: click on the aayah to listen to it
  el_title.innerText = title
  load(st, en, () => preview([ '', ayat.slice(st-1, en).map(a => a.replace(/#/, '\ufdfd\n')) ]))
}

function make_title (sura_bgn, aaya_bgn, sura_end, aaya_end) {

  const nbsp = '\xa0'
  // all numbers are 1-based
  sura_bgn = +sura_bgn
  aaya_bgn = +aaya_bgn
  sura_end = +sura_end
  aaya_end = +aaya_end
  const s_bgn_len = sura_length[sura_bgn - 1]
  const s_end_len = sura_length[sura_end - 1]
  const s_bgn_txt = sura_name[sura_bgn - 1]
  const s_end_txt = sura_name[sura_end - 1]
  // converts to Eastern Arabic numerals, and state the first and last in words
  const a_bgn_txt = aaya_bgn === 1? 'الأولى' : aaya_bgn === s_bgn_len? toarab(aaya_bgn) + nbsp+'الأخيرة' : toarab(aaya_bgn)
  const a_end_txt = aaya_end === 1? 'الأولى' : aaya_end === s_end_len? toarab(aaya_end) + nbsp+'الأخيرة' : toarab(aaya_end)
  //
  if (sura_bgn === sura_end) {  // if exactly one aaya
    if (aaya_bgn === aaya_end) {
      return `الآية${nbsp}${a_bgn_txt} من${nbsp}سورة${nbsp}${s_bgn_txt}`
    }
    if (aaya_end === aaya_bgn + 1) {  // if exactly two ayat
      return `الآيتين${nbsp}${a_bgn_txt} و${a_end_txt} من${nbsp}سورة${nbsp}${s_bgn_txt}`
    }
    if (aaya_bgn === 1 && aaya_end === s_end_len) {  // if one complete sura
      return `سورة ${s_bgn_txt}`
    }
    // otherwise: one partial sura
    return `سورة${nbsp}${s_bgn_txt} من${nbsp}الآية${nbsp}${a_bgn_txt} حتى${nbsp}الآية${nbsp}${a_end_txt}`
  }
  // more than one sura:
  if (aaya_bgn === 1 && aaya_end === s_end_len) {  // if multiple complete suar
    if (sura_end === sura_bgn + 1) {  // if exactly two
      return `سورتي ${s_bgn_txt} و${s_end_txt}`
    }
    // otherwise: more than two (one is handled previously)
    return `السور من${nbsp}${s_bgn_txt} حتى${nbsp}${s_end_txt}`
  }
  // otherwise
  return `الآيات من${nbsp}سورة${nbsp}${s_bgn_txt} الآية${nbsp}${a_bgn_txt} حتى${nbsp}سورة${nbsp}${s_end_txt} الآية${nbsp}${a_end_txt}`
}

el_ok.onclick = start_reciting
el_show.onclick = el_reshow.onclick = show_first
el_repeat.onclick = () => { start_reciting() }

el_new.onclick = () => {
  show_selectors()
  clear_board()
}

