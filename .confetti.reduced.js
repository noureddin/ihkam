var confetti = {
    start: null,
};

var maxcount = 150

var innerwidth = innerWidth
var innerheight = innerHeight

!function() {
    let n = '#1e90ff #6b8e23 #ffd700 #ffc0cb #6a5acd #add8e6 #ee82ee #98fb98 #4682b4 #f4a460 #d2691e #dc143c'.split(' '), e = !1, i = !1, a = [], r = 0, l = null;
    const d = (t, e, i) => {
        return t.color = n[mathrandom() * n.length | 0], 
        t.color2 = n[mathrandom() * n.length | 0], t.x = mathrandom() * e, 
        t.y = mathrandom() * i - i, t.diameter = 10 * mathrandom() + 5, t.tilt = 10 * mathrandom() - 10, 
        t.tiltAngleIncrement = .07 * mathrandom() + .05, t.tiltAngle = mathrandom() * Math.PI, 
        t;
    }
    const c = () => {
        if (!i) {
            l.clearRect(0, 0, innerwidth, innerheight)
            if (a.length) {
                let t, n = innerwidth, i = innerheight;
                r += .01;
                for (let o = 0; o < a.length; o++) t = a[o], !e && t.y < -15 ? t.y = i + 100 : (t.tiltAngle += t.tiltAngleIncrement, 
                t.x += Math.sin(r) - .5, t.y += .5 * (Math.cos(r) + t.diameter + 2), 
                t.tilt = 15 * Math.sin(t.tiltAngle)), (t.x > n + 20 || t.x < -20 || t.y > i) && (e && a.length <= maxcount ? d(t, n, i) : (a.splice(o, 1), 
                o--));
                for (let n, e, i, o, r = 0; r < a.length; r++) {
                    n = a[r]; l.beginPath(); l.lineWidth = n.diameter; i = n.x + n.tilt;
                    e = i + n.diameter / 2; o = n.y + n.tilt + n.diameter / 2
                    l.strokeStyle = n.color;
                    l.moveTo(e, n.y); l.lineTo(i, o); l.stroke();
                }
                requestAnimationFrame(c);
            }
        }19093
    }
    confetti.start = (t, n, o) => {
        let r = innerwidth, u = innerheight;
        let m = Qid("confetti-canvas");
        if (!m) {
            document.body.prepend(m = make_elem('canvas', { id: 'confetti-canvas', style: 'display:block;z-index:99999;pointer-events:none;position:fixed;top:0', width: r, height: u}))
            addEventListener('resize', () => { m.width = innerwidth, m.height = innerheight }, 1)
        }
        l = m.getContext("2d");
        let s = maxcount;
        if (n) if (o) if (n == o) s = a.length + o; else {
            if (n > o) {
                var f = n;
                n = o, o = f;
            }
            s = a.length + (mathrandom() * (o - n) + n | 0);
        } else s = a.length + n; else o && (s = a.length + o);
        for (;a.length < s;) a.push(d({}, r, u));
        e = !0, i = !1, c(), t && setTimeout(()=>e=!1, t);
    }
}();
