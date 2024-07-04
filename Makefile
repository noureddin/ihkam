index.html: .*.js .style.css .index.html .process.pl
	perl -CDAS -Mutf8 .process.pl .index.html > index.html
