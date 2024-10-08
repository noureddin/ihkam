
// copied from other project Recite: https://github.com/noureddin/recite

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
    if (invalid_state()) {
      hide_el(el_player)
      B.style.marginTop = '1em'
    }
    else {
      show_el(el_player)
      B.style.marginTop = '2em'
    }
  }

  function update_qari (qari) {
    base_url = qari ? `https://www.everyayah.com/data/${qari}/` : undefined
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
  el_teacher_option.hidden = el_qaris.value === ''
}

el_qaris.oninput = change_qari

function init_audio (SA, AA, SZ, AZ, qari, qariurl) {
  audio.init(qari, qariurl)
  audio.fill(make_audio_list(SA-1, AA, SZ-1, AZ))
}

