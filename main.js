'use strict'

function decode_contact () {
  let xyz = Qid('xyz')
  let mia_nomo = Q('body').innerHTML.match(/github[.]com\/([a-z0-9]+)\//)[1]
  xyz.innerHTML = mia_nomo + String.fromCharCode(1<<6) + 'pro' + (''+(!![]))[+![]] + 'moc.liamno'.split('').reverse().join('')
  xyz.href = xyz.innerHTML.slice(16,20) + 'to' + String.fromCharCode('xyz'.charCodeAt(1<<1)^0O100) + xyz.innerHTML
  // if you know a better way, please let me know!
}

init_inputs()
validate_aaya_sura_input({})
decode_contact()

// todo:
// - favicon
// - identical phrases
// - audio recitation
// - tajweed
// - break long phrases! (postponed)
