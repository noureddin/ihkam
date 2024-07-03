'use strict'

// copied from other project Recite: https://github.com/noureddin/recite

const el_qaris = Qid("qaris")
const el_player = Qid("player")
const el_preloader = Qid("preloader")

const hide_el = (el) => { el.style.visibility = 'hidden';  el.style.opacity =   '0%' }
const show_el = (el) => { el.style.visibility = 'visible'; el.style.opacity = '100%' }

const audio = (function () {
  let list
  let base_url
  let cur_idx

  function index (i) { return i != null ? i : cur_idx }

  function invalid_state (idx) {
    idx = index(idx)
    return idx == null || idx < 0 || !base_url || !list || idx >= list.length
  }

  function audio_url (idx) {
    idx = index(idx)
    if (invalid_state(idx)) { return }
    return base_url + list[idx] + '.mp3'
  }

  function fetch (idx) {
    idx = index(idx)
    if (invalid_state(idx)) { return }
    el_preloader.src = audio_url(idx)
  }

  function play () {
    if (invalid_state()) { return }
    el_player.src = audio_url()
    el_player.addEventListener('loadeddata', () => fetch(cur_idx + 1))
    el_player.play()
  }

  function set_idx (i) { cur_idx = i; fetch() }

  function show_or_hide_player () {
    invalid_state() ? hide_el(el_player) : show_el(el_player)
  }

  function update_qari (qari) {
    if (qari) { base_url = `https://www.everyayah.com/data/${qari}/` }
    fetch()
  }

  return {

    update_qari: function (qari) {
      update_qari(qari)
      show_or_hide_player()
    },

    init: function (qari, qariurl) {
      update_qari(qari)
      if (!qari && qariurl) {
        base_url = qariurl.endsWith('/') ? qariurl : qariurl + '/'
      }
      set_idx(0)
    },

    fill: function (ayat) {
      list = ayat
      set_idx(0)
      show_or_hide_player()
    },

    play: function (idx) {
      if (idx != null) { set_idx(idx) }
      show_or_hide_player()
      play()
    },

    set_index: function (i) { set_idx(i) },
    next: function () { set_idx(cur_idx + 1) },
    back: function () { set_idx(cur_idx - 1) },

  }
})()

function change_qari () {
  audio.update_qari(el_qaris.value)
}

function init_audio (SA, AA, SZ, AZ, qari, qariurl) {
  audio.init(qari, qariurl)
  audio.fill(make_audio_list(SA-1, AA, SZ-1, AZ))
}

