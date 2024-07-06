#!/usr/bin/env perl
use v5.16; use warnings; use autodie; use utf8;
use open qw[ :encoding(UTF-8) :std ];

sub slurp(_) { local $/; open my $f, '<', $_[0]; return scalar <$f> }
sub slurp_stdin() { local $/; return scalar <> }

sub execute { my $ret = scalar `$_[0]`; chomp $ret; return $ret }

my $css = 'deno run --quiet --allow-read --allow-env=HTTP_PROXY,http_proxy npm:clean-css-cli';
my $js  = 'deno run --quiet --allow-read --allow-env=UGLIFY_BUG_REPORT npm:uglify-js';

my $mangle = 1;  # set to 0 for debug, to 1 for prod

# global fns defined in JS that are called from HTML
my $R = sprintf '[%s]', join ',', qw[
];

my @scripts = qw[
  .utils.js
  .audio.js
  .selectors.js
  .logic.js
  .g.js
  .z.js
  .ligilumi.js
  .main.js
  .confetti.min.js
];

## BEGIN

local $_ = slurp_stdin;

## PROCESS & MINIFY

my $legend = join '', map {
  sprintf '<tr><td class="w %s">العبارة الظاهرة بهذا اللون</td><td>%s.</td></tr>', @$_
}
  ['m0', 'تعني أنها بلا أخطاء'],
  ['m1', 'تعني أنها بخطأ واحد'],
  ['m2', 'تعني أنها بخطأين'],
  ['m3', 'تعني أنها بثلاثة أخطاء'],
  ['m4', 'تعني أنها بأربعة أخطاء'],
  ['mx', 'لأكثر من أربعة أخطاء، أو متأخرة وبأكثر من خطأ'],
  ['d0', 'تعني أنها متأخرة لكن بغير خطأ'],
  ['d1', 'تعني أنها متأخرة وبخطأ واحد'],
  ['df', 'للعبارة الأولى فقط، لو متأخرة لكن بغير خطأ'],
;
s{<<legend>>}{$legend}sg;

my $title = 'إحكام - اختبر حفظك للقرآن الكريم بترتيب أجزاء الآيات';
my $desc = 'تطبيق وب مجاني لمراجعة حفظ القرآن الكريم بطريقة سهلة مثل ألغاز تركيب الصور، للحاسوب والمحمول.';
my $url = 'https://www.noureddin.dev/ihkam';

s{<<meta>>}{
  <title>$title</title>
  <meta property="og:locale" content="ar_AR">
  <meta property="og:type" content="website">
  <meta property="og:title" content="$title">
  <meta property="og:image" content="$url/cover.png">
  <meta property="og:image:width" content="1120"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:description" content="$desc">
  <meta name="description" content="$desc">
  <link rel="canonical" href="$url/">
  <meta property="og:url" content="$url/">
  <link rel="icon" type="image/png" sizes="72x72" href="res/favicon-72.png">
  <link rel="icon" type="image/png" sizes="16x16" href="res/favicon-16.png">
  <link rel="icon" type="image/svg+xml" sizes="any" href="res/favicon.svg">
}sg;

s{<<qaris>>}{
  sprintf '%s',
  execute q' cat res/qaris | while read value; do read title; printf "<option value=%s>%s</option>" "$value" "$title"; done '
}sge;

# minify html
s/\s+</</g;  # note: this changes the behavior of the html; I'm relying on that
s/\s+>/>/g;
s/<!--.*?-->//g;
s/\s+/ /g;
s/\A //;
s/ \Z//;

s{<<style>>}{
  sprintf '<style>%s</style>',
  execute qq[ $css .style.css ]
}ge;

s{<<script>>}{
  my $m = $mangle ? "--mangle toplevel,reserved='$R'" : "";
  sprintf '<script>"use strict";%s</script>',
  execute qq[ cat @scripts | $js --compress top_retain='$R',passes=10 $m ]
}sge;

s{<<party-popper>>}{
  sprintf '%s',
  slurp 'res/party-popper.svg'
}sge;

## END

print;
