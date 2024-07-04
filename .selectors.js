'use strict'

// copied from my other project: Recite: https://github.com/noureddin/recite

const el_selectors = Qid("selectors")
const el_sura_bgn = Qid("sura_bgn")
const el_aaya_bgn = Qid("aaya_bgn")
const el_sura_end = Qid("sura_end")
const el_aaya_end = Qid("aaya_end")
const el_ok = Qid("ok")
const el_header = Qid("header")
const el_new = Qid("new")
const el_repeat = Qid("repeat")

const suar_length = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
const suar_name = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس',]
function start_ (s) { return +suar_length.slice(0, s).reduce((a, b) => a + b, 0) }
const sura_offset = range(115).map(start_)  // array mapping 0-based suar to how many ayat before it (eg 0 => 0, 1 => 7, 2 => 286+7)

suar_name.forEach((name, idx) => {
  const opt = document.createElement('option')
  opt.value = idx
  opt.text = name
  el_sura_bgn.add(opt)
  el_sura_end.add(opt.cloneNode(true))
})

// tr num & fields()
// TODO see: https://stackoverflow.com/q/10726638

const filter_aaya_input = (n) =>  // remove non-numerals and convert numerals to Eastern Arabic
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

const defilter_aaya_input = (n) =>  // convert numerals to ASCII
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

const sura_bgn_length = () => el_sura_bgn.value === '' ? 0  :         suar_length[+el_sura_bgn.value]
const sura_end_length = () => el_sura_end.value === '' ? 0  :         suar_length[+el_sura_end.value]
const sura_bgn_val    = () => el_sura_bgn.value === '' ? '' :                     +el_sura_bgn.value
const sura_end_val    = () => el_sura_end.value === '' ? '' :                     +el_sura_end.value
const aaya_bgn_val    = () => el_aaya_bgn.value === '' ? '' : +defilter_aaya_input(el_aaya_bgn.value)
const aaya_end_val    = () => el_aaya_end.value === '' ? '' : +defilter_aaya_input(el_aaya_end.value)

// validate_aaya_sura_input
// called oninput and onblur with the element; only called for {sura,aaya}_{bgn,end} inputs.
// sometimes updates the input fields. and enables #ok if the inputs are valid.
function validate_aaya_sura_input (ev) {
  const el = ev.target
  const blur = ev.type === 'blur'
  const is_aaya = el === el_aaya_bgn || el === el_aaya_end

  el_aaya_bgn.value = filter_aaya_input(el_aaya_bgn.value)
  el_aaya_end.value = filter_aaya_input(el_aaya_end.value)

  if (blur && is_aaya && el.value === '') {
    if (el === el_aaya_bgn) {
      if (el_sura_bgn.value !== '') { el.value = 0 }
    }
    else {  // el === el_aaya_end
      if (el_sura_end.value !== '') { el.value = 300 }
    }
  }

  const set_aaya_bgn = (n) => el_aaya_bgn.value = filter_aaya_input(+n)
  const set_aaya_end = (n) => el_aaya_end.value = filter_aaya_input(+n)

  // if the changed field is sura_bgn, make aaya_bgn 1 if empty,
  // and update sura_end if empty or is before sura_bgn
  if (!blur && el === el_sura_bgn) {
    if (aaya_bgn_val() === '') { set_aaya_bgn(1) }
    if (sura_end_val() === '' || sura_end_val() < sura_bgn_val()) {
      el_sura_end.value = sura_bgn_val()
      set_aaya_end(sura_end_length())
    }
  }
  // if the changed field is sura_end, make aaya_end the last aya,
  // and update sura_bgn if empty or is after sura_end
  else if (!blur && el === el_sura_end) {
    set_aaya_end(sura_end_length())
    if (sura_bgn_val() === '' || (sura_end_val() !== '' && sura_end_val() < sura_bgn_val())) {
      el_sura_bgn.value = sura_end_val()
      set_aaya_bgn(1)
    }
  }

  // make sure ayat are within limits:

  // ayat upper-limits:
  if (aaya_bgn_val() > sura_bgn_length()) { set_aaya_bgn(sura_bgn_length()) }
  if (aaya_end_val() > sura_end_length()) { set_aaya_end(sura_end_length()) }

  // ayat lower-limits:
  if (aaya_bgn_val() === 0) { set_aaya_bgn(1) }
  if (aaya_end_val() === 0) { set_aaya_end(1) }
  // '' is checked for in the onblur case above
  // a negative sign is not allowed to be entered

  if (sura_bgn_val() !== '' && sura_end_val() !== '' &&
      aaya_bgn_val() !== '' && aaya_end_val() !== ''
  ) {
    // console.log('valid', sura_bgn_val(), sura_end_val(), aaya_bgn_val(), aaya_end_val())
    el_ok.disabled = false
  }
  else {
    // console.log('invalid')
    el_ok.disabled = true
  }
}

function valid_inputs (sura_bgn, aaya_bgn, sura_end, aaya_end) {  // {{{
  return (
    sura_bgn !== '' && aaya_bgn !== '' &&
    sura_end !== '' && aaya_end !== '' &&
    sura_bgn <= sura_end &&
    (aaya_bgn <= aaya_end || sura_bgn < sura_end) &&
    1 <= aaya_bgn && aaya_bgn <= suar_length[sura_bgn] &&
    1 <= aaya_end && aaya_end <= suar_length[sura_end]
  )
}

function input_trigger_x (ev) {
  // this fn is connected to onkeyup and onmouseup. it handles three "events"

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

  // Up or Down on an ayat-input, increase or decrease it
  if (on_ayat) {
    let el = Qid(id)
    if (key === 'ArrowUp')   { el.value = 1 + +defilter_aaya_input(el.value) }
    if (key === 'ArrowDown') { el.value = 1 - +defilter_aaya_input(el.value) }
    validate_aaya_sura_input(ev)  // handles the filtering and the limits
    return
  }
}

function init_inputs () {
  el_sura_bgn.value   = el_aaya_bgn.value   = el_sura_end.value   = el_aaya_end.value   = ''
  el_sura_bgn.oninput = el_aaya_bgn.oninput = el_sura_end.oninput = el_aaya_end.oninput = validate_aaya_sura_input
  el_sura_bgn.onblur  = el_aaya_bgn.onblur  = el_sura_end.onblur  = el_aaya_end.onblur  = validate_aaya_sura_input
  el_sura_bgn.onkeyup = el_aaya_bgn.onkeyup = el_sura_end.onkeyup = el_aaya_end.onkeyup = input_trigger_x
}

const hide_selectors = function () {
  el_qaris.disabled = true
  el_teacher_input.disabled = true
  el_selectors.hidden = true
  el_ok.hidden = true
  //
  el_header.hidden = false
}

const show_selectors = function () {
  validate_aaya_sura_input({})  // filters inputs & disables/enables ok button
  //
  el_qaris.disabled = false
  el_teacher_input.disabled = false
  el_selectors.hidden = false
  el_ok.hidden = false
  //
  el_header.hidden = true
}

function start_reciting () {
  const [SA, AA] = [sura_bgn_val(), aaya_bgn_val()]
  const [SZ, AZ] = [sura_end_val(), aaya_end_val()]
  if (!valid_inputs(SA, AA, SZ, AZ)) { return }
  const st = sura_offset[SA] + AA
  const en = sura_offset[SZ] + AZ
  const title = make_title(+SA+1, +AA, +SZ+1, +AZ)[0].replace(/تسميع /, 'رتب عبارات ')
  init_audio(+SA+1, +AA, +SZ+1, +AZ, el_qaris.value)
  hide_selectors()
  load(st, en, () => recite(ayat.slice(st-1, en).map(a => a.replace(/#/, '\ufdfd\n')), title))
}

function make_title (sura_bgn, aaya_bgn, sura_end, aaya_end) {

  //// the longest strings (some are impossible):
  // return ["تسميع الآية ٣٠٠ الأخيرة من سورة العنكبوت", 'oneaaya']
  // return ["تسميع سورة العنكبوت كاملة", 'onesura']
  // return ["تسميع سورة العنكبوت من الآية ٣٠٠ حتى الآية ٣٠٠ الأخيرة", 'manyaaya']
  // return ["تسميع سورتي العنكبوت والعنكبوت كاملتين", 'twosura']
  // return ["تسميع السور من العنكبوت حتى العنكبوت", 'manysura']
  // return ["تسميع من سورة العنكبوت الآية ٣٠٠ الأخيرة حتى سورة العنكبوت الآية ٣٠٠ الأخيرة", 'manymany']
  // return ["تسميع الآيتين ٣٠٠ الأخيرة و٣٠٠ الأخيرة من سورة العنكبوت", 'twoaaya']

  const nbsp = '\xa0'
  // all numbers are 1-based
  sura_bgn = +sura_bgn
  aaya_bgn = +aaya_bgn
  sura_end = +sura_end
  aaya_end = +aaya_end
  const s_bgn_len = suar_length[sura_bgn - 1]
  const s_end_len = suar_length[sura_end - 1]
  const s_bgn_txt = suar_name[sura_bgn - 1]
  const s_end_txt = suar_name[sura_end - 1]
  // converts to Eastern Arabic numerals, and state the first and last in words
  const a_bgn_txt = aaya_bgn === 1? 'الأولى' : aaya_bgn === s_bgn_len?  filter_aaya_input(aaya_bgn) + ' الأخيرة' : filter_aaya_input(aaya_bgn)
  const a_end_txt = aaya_end === 1? 'الأولى' : aaya_end === s_end_len?  filter_aaya_input(aaya_end) + ' الأخيرة' : filter_aaya_input(aaya_end)
  //
  if (sura_bgn === sura_end) {
    // if exactly one aaya
    if (aaya_bgn === aaya_end) {
      return [`تسميع الآية${nbsp}${a_bgn_txt} من${nbsp}سورة${nbsp}${s_bgn_txt}`, '']
    }
    // if exactly two ayat
    if (aaya_end === aaya_bgn + 1) {
      return [`تسميع الآيتين${nbsp}${a_bgn_txt} و${a_end_txt} من${nbsp}سورة${nbsp}${s_bgn_txt}`, '']
    }
    // if one complete sura
    if (aaya_bgn === 1 && aaya_end === s_end_len) {
      return [`تسميع سورة ${s_bgn_txt} كاملة`, '']
    }
    // otherwise: one partial sura
    return [`تسميع سورة${nbsp}${s_bgn_txt} من${nbsp}الآية${nbsp}${a_bgn_txt} حتى${nbsp}الآية${nbsp}${a_end_txt}`, '']
  }
  // more than one sura:
  // if multiple complete suar
  if (aaya_bgn === 1 && aaya_end === s_end_len) {
    // if exactly two
    if (sura_end === sura_bgn + 1) {
      return [`تسميع سورتي ${s_bgn_txt} و${s_end_txt} كاملتين`, '']
    }
    // otherwise: more than two (one is handled previously)
    return [`تسميع السور من${nbsp}${s_bgn_txt} حتى${nbsp}${s_end_txt}`, '']
  }
  // otherwise
  return [`تسميع من${nbsp}سورة${nbsp}${s_bgn_txt} الآية${nbsp}${a_bgn_txt} حتى${nbsp}سورة${nbsp}${s_end_txt} الآية${nbsp}${a_end_txt}`, 'manymany']
}

el_ok.onclick = start_reciting
el_repeat.onclick = () => { start_reciting() }

el_new.onclick = () => {
  show_selectors()
  clear_board()
}

