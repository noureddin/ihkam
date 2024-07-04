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
  .versligilumi.js
  .main.js
  .confetti.min.js
];

## BEGIN

local $_ = slurp_stdin;

## PROCESS & MINIFY

s{<<meta>>}{
<title>إحكام - اختبر حفظك للقرآن الكريم بترتيب أجزاء الآيات</title>
<link rel="icon" type="image/png" sizes="16x16" href="res/favicon-16.png">
}sg;

s{<<qaris>>}{
  sprintf '%s',
  execute q' cat res/qaris | while read value; do read title; printf "<option value=%s>%s</option>" "$value" "$title"; done '
}sge;

# minify html
s/>\s+</></g;
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
  sprintf '<script>%s</script>',
  execute qq[ cat @scripts | $js --compress top_retain='$R',passes=10 $m ]
}sge;

s{<<party-popper>>}{
  sprintf '%s',
  slurp 'res/party-popper.svg'
}sge;

## END

print;
