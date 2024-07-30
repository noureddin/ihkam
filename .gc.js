if (!(location.search + location.hash).split(/[?&#]/).includes('nostats')) {
  window.goatcounter = { path: location.href, allow_frame: true }
  // privacy-friendly statistics, no tracking of personal data, no need for GDPR consent; see goatcounter.com
  B.append(make_elem('script', { Dataset: { goatcounter: 'https://ihkam.goatcounter.com/count' }, async: true, src: '//gc.zgo.at/count.js' }))
}
