/**********************************
 * Symbols and Special Characters
 *********************************/

LatexCmds.f = bind(Symbol, 'f', '<var class="florin">&fnof;</var><span></span>');

function Variable(ch, html) {
  Symbol.call(this, ch, '<var>'+(html || ch)+'</var>');
}
_ = Variable.prototype = new Symbol;
_.text = function() {
  var text = this.cmd;
  if (this.prev && !(this.prev instanceof Variable)
      && !(this.prev instanceof BinaryOperator))
    text = '*' + text;
  if (this.next && !(this.next instanceof BinaryOperator)
      && !(this.next.cmd === '^'))
    text += '*';
  return text;
};

function VanillaSymbol(ch, html) {
  Symbol.call(this, ch, '<span>'+(html || ch)+'</span>');
}
VanillaSymbol.prototype = Symbol.prototype;

CharCmds[' '] = bind(VanillaSymbol, '\\:', ' ');

LatexCmds.prime = CharCmds["'"] = bind(VanillaSymbol, "'", '&prime;');

function NonSymbolaSymbol(ch, html) { //does not use Symbola font
  Symbol.call(this, ch, '<span class="nonSymbola">'+(html || ch)+'</span>');
}
NonSymbolaSymbol.prototype = Symbol.prototype;

LatexCmds['@'] = NonSymbolaSymbol;
LatexCmds['&'] = bind(NonSymbolaSymbol, '\\&', '&');
LatexCmds['%'] = bind(NonSymbolaSymbol, '\\%', '%');

//the following are all Greek to me, but this helped a lot: http://www.ams.org/STIX/ion/stixsig03.html

//lowercase Greek letter variables
LatexCmds.alpha =
LatexCmds.beta =
LatexCmds.gamma =
LatexCmds.delta =
LatexCmds.zeta =
LatexCmds.eta =
LatexCmds.theta =
LatexCmds.iota =
LatexCmds.kappa =
LatexCmds.mu =
LatexCmds.nu =
LatexCmds.xi =
LatexCmds.rho =
LatexCmds.sigma =
LatexCmds.tau =
LatexCmds.chi =
LatexCmds.psi =
LatexCmds.omega = proto(Symbol, function(replacedFragment, latex) {
  Variable.call(this,'\\'+latex+' ','&'+latex+';');
});

//why can't anybody FUCKING agree on these
LatexCmds.phi = //W3C or Unicode?
  bind(Variable,'\\phi ','&#981;');

LatexCmds.phiv = //Elsevier and 9573-13
LatexCmds.varphi = //AMS and LaTeX
  bind(Variable,'\\varphi ','&phi;');

LatexCmds.epsilon = //W3C or Unicode?
  bind(Variable,'\\epsilon ','&#1013;');

LatexCmds.epsiv = //Elsevier and 9573-13
LatexCmds.varepsilon = //AMS and LaTeX
  bind(Variable,'\\varepsilon ','&epsilon;');

LatexCmds.piv = //W3C/Unicode and Elsevier and 9573-13
LatexCmds.varpi = //AMS and LaTeX
  bind(Variable,'\\varpi ','&piv;');

LatexCmds.sigmaf = //W3C/Unicode
LatexCmds.sigmav = //Elsevier
LatexCmds.varsigma = //LaTeX
  bind(Variable,'\\varsigma ','&sigmaf;');

LatexCmds.thetav = //Elsevier and 9573-13
LatexCmds.vartheta = //AMS and LaTeX
LatexCmds.thetasym = //W3C/Unicode
  bind(Variable,'\\vartheta ','&thetasym;');

LatexCmds.upsilon = //AMS and LaTeX and W3C/Unicode
LatexCmds.upsi = //Elsevier and 9573-13
  bind(Variable,'\\upsilon ','&upsilon;');

//these aren't even mentioned in the HTML character entity references
LatexCmds.gammad = //Elsevier
LatexCmds.Gammad = //9573-13 -- WTF, right? I dunno if this was a typo in the reference (see above)
LatexCmds.digamma = //LaTeX
  bind(Variable,'\\digamma ','&#989;');

LatexCmds.kappav = //Elsevier
LatexCmds.varkappa = //AMS and LaTeX
  bind(Variable,'\\varkappa ','&#1008;');

LatexCmds.rhov = //Elsevier and 9573-13
LatexCmds.varrho = //AMS and LaTeX
  bind(Variable,'\\varrho ','&#1009;');

//Greek constants, look best in un-italicised Times New Roman
LatexCmds.pi = LatexCmds['π'] = bind(NonSymbolaSymbol,'\\pi ','&pi;');
LatexCmds.lambda = bind(NonSymbolaSymbol,'\\lambda ','&lambda;');

//uppercase greek letters

LatexCmds.Upsilon = //LaTeX
LatexCmds.Upsi = //Elsevier and 9573-13
LatexCmds.upsih = //W3C/Unicode "upsilon with hook"
LatexCmds.Upsih = //'cos it makes sense to me
  bind(Symbol,'\\Upsilon ','<var style="font-family: serif">&upsih;</var>'); //Symbola's 'upsilon with a hook' is a capital Y without hooks :(

LatexCmds.Gamma =
LatexCmds.Delta =
LatexCmds.Theta =
LatexCmds.Lambda =
LatexCmds.Xi =
LatexCmds.Pi =
LatexCmds.Sigma =
LatexCmds.Phi =
LatexCmds.Psi =
LatexCmds.Omega =

//other symbols with the same LaTeX command and HTML character entity reference
LatexCmds.forall = proto(Symbol, function(replacedFragment, latex) {
  VanillaSymbol.call(this,'\\'+latex+' ','&'+latex+';');
});

function BinaryOperator(cmd, html, text) {
  Symbol.call(this, cmd, '<span class="binary-operator">'+html+'</span>', text);
}
BinaryOperator.prototype = new Symbol; //so instanceof will work

function PlusMinus(cmd, html) {
  VanillaSymbol.apply(this, arguments);
}
_ = PlusMinus.prototype = new BinaryOperator; //so instanceof will work
_.respace = function() {
  if (!this.prev) {
    this.jQ[0].className = '';
  }
  else if (
    this.prev instanceof BinaryOperator &&
    this.next && !(this.next instanceof BinaryOperator)
  ) {
    this.jQ[0].className = 'unary-operator';
  }
  else {
    this.jQ[0].className = 'binary-operator';
  }
  return this;
};

LatexCmds['+'] = bind(PlusMinus, '+');
//yes, these are different dashes, I think one is an en dash and the other is a hyphen
LatexCmds['–'] = LatexCmds['-'] = bind(PlusMinus, '-', '&minus;');
LatexCmds['±'] = LatexCmds.pm = LatexCmds.plusmn = LatexCmds.plusminus =
  bind(PlusMinus,'\\pm ','&plusmn;');
LatexCmds.mp = LatexCmds.mnplus = LatexCmds.minusplus =
  bind(PlusMinus,'\\mp ','&#8723;');

CharCmds['*'] = LatexCmds.sdot = LatexCmds.cdot =
  bind(BinaryOperator, '\\cdot ', '&middot;');
//semantically should be &sdot;, but &middot; looks better

LatexCmds['='] = bind(BinaryOperator, '=', '=');
LatexCmds['<'] = bind(BinaryOperator, '<', '&lt;');
LatexCmds['>'] = bind(BinaryOperator, '>', '&gt;');

LatexCmds.notin =
LatexCmds.sim =
LatexCmds.cong =
LatexCmds.equiv =
LatexCmds.oplus =
LatexCmds.otimes = proto(BinaryOperator, function(replacedFragment, latex) {
  BinaryOperator.call(this, '\\'+latex+' ', '&'+latex+';');
});

LatexCmds.times = proto(BinaryOperator, function(replacedFragment, latex) {
  BinaryOperator.call(this, '\\times ', '&times;', '[x]')
});

LatexCmds['÷'] = LatexCmds.div = LatexCmds.divide = LatexCmds.divides =
  bind(BinaryOperator,'\\div ','&divide;', '[/]');

LatexCmds['≠'] = LatexCmds.ne = LatexCmds.neq = bind(BinaryOperator,'\\ne ','&ne;');

LatexCmds.ast = LatexCmds.star = LatexCmds.loast = LatexCmds.lowast =
  bind(BinaryOperator,'\\ast ','&lowast;');
  //case 'there4 = // a special exception for this one, perhaps?
LatexCmds.therefor = LatexCmds.therefore =
  bind(BinaryOperator,'\\therefore ','&there4;');

LatexCmds.cuz = // l33t
LatexCmds.because = bind(BinaryOperator,'\\because ','&#8757;');

LatexCmds.prop = LatexCmds.propto = bind(BinaryOperator,'\\propto ','&prop;');

LatexCmds['≈'] = LatexCmds.asymp = LatexCmds.approx = bind(BinaryOperator,'\\approx ','&asymp;');

LatexCmds.lt = bind(BinaryOperator,'<','&lt;');

LatexCmds.gt = bind(BinaryOperator,'>','&gt;');

LatexCmds['≤'] = LatexCmds.le = LatexCmds.leq = bind(BinaryOperator,'\\le ','&le;');

LatexCmds['≥'] = LatexCmds.ge = LatexCmds.geq = bind(BinaryOperator,'\\ge ','&ge;');

LatexCmds.isin = LatexCmds['in'] = bind(BinaryOperator,'\\in ','&isin;');

LatexCmds.ni = LatexCmds.contains = bind(BinaryOperator,'\\ni ','&ni;');

LatexCmds.notni = LatexCmds.niton = LatexCmds.notcontains = LatexCmds.doesnotcontain =
  bind(BinaryOperator,'\\not\\ni ','&#8716;');

LatexCmds.sub = LatexCmds.subset = bind(BinaryOperator,'\\subset ','&sub;');

LatexCmds.sup = LatexCmds.supset = LatexCmds.superset =
  bind(BinaryOperator,'\\supset ','&sup;');

LatexCmds.nsub = LatexCmds.notsub =
LatexCmds.nsubset = LatexCmds.notsubset =
  bind(BinaryOperator,'\\not\\subset ','&#8836;');

LatexCmds.nsup = LatexCmds.notsup =
LatexCmds.nsupset = LatexCmds.notsupset =
LatexCmds.nsuperset = LatexCmds.notsuperset =
  bind(BinaryOperator,'\\not\\supset ','&#8837;');

LatexCmds.sube = LatexCmds.subeq = LatexCmds.subsete = LatexCmds.subseteq =
  bind(BinaryOperator,'\\subseteq ','&sube;');

LatexCmds.supe = LatexCmds.supeq =
LatexCmds.supsete = LatexCmds.supseteq =
LatexCmds.supersete = LatexCmds.superseteq =
  bind(BinaryOperator,'\\supseteq ','&supe;');

LatexCmds.nsube = LatexCmds.nsubeq =
LatexCmds.notsube = LatexCmds.notsubeq =
LatexCmds.nsubsete = LatexCmds.nsubseteq =
LatexCmds.notsubsete = LatexCmds.notsubseteq =
  bind(BinaryOperator,'\\not\\subseteq ','&#8840;');

LatexCmds.nsupe = LatexCmds.nsupeq =
LatexCmds.notsupe = LatexCmds.notsupeq =
LatexCmds.nsupsete = LatexCmds.nsupseteq =
LatexCmds.notsupsete = LatexCmds.notsupseteq =
LatexCmds.nsupersete = LatexCmds.nsuperseteq =
LatexCmds.notsupersete = LatexCmds.notsuperseteq =
  bind(BinaryOperator,'\\not\\supseteq ','&#8841;');


//sum, product, coproduct, integral
function BigSymbol(ch, html) {
  Symbol.call(this, ch, '<big>'+html+'</big>');
}
BigSymbol.prototype = new Symbol; //so instanceof will work

LatexCmds['∑'] = LatexCmds.sum = LatexCmds.summation = bind(BigSymbol,'\\sum ','&sum;');
LatexCmds['∏'] = LatexCmds.prod = LatexCmds.product = bind(BigSymbol,'\\prod ','&prod;');
LatexCmds.coprod = LatexCmds.coproduct = bind(BigSymbol,'\\coprod ','&#8720;');
LatexCmds['∫'] = LatexCmds.int = LatexCmds.integral = bind(BigSymbol,'\\int ','&int;');



//the canonical sets of numbers
LatexCmds.N = LatexCmds.naturals = LatexCmds.Naturals =
  bind(VanillaSymbol,'\\mathbb{N}','&#8469;');

LatexCmds.P =
LatexCmds.primes = LatexCmds.Primes =
LatexCmds.projective = LatexCmds.Projective =
LatexCmds.probability = LatexCmds.Probability =
  bind(VanillaSymbol,'\\mathbb{P}','&#8473;');

LatexCmds.Z = LatexCmds.integers = LatexCmds.Integers =
  bind(VanillaSymbol,'\\mathbb{Z}','&#8484;');

LatexCmds.Q = LatexCmds.rationals = LatexCmds.Rationals =
  bind(VanillaSymbol,'\\mathbb{Q}','&#8474;');

LatexCmds.R = LatexCmds.reals = LatexCmds.Reals =
  bind(VanillaSymbol,'\\mathbb{R}','&#8477;');

LatexCmds.C =
LatexCmds.complex = LatexCmds.Complex =
LatexCmds.complexes = LatexCmds.Complexes =
LatexCmds.complexplane = LatexCmds.Complexplane = LatexCmds.ComplexPlane =
  bind(VanillaSymbol,'\\mathbb{C}','&#8450;');

LatexCmds.H = LatexCmds.Hamiltonian = LatexCmds.quaternions = LatexCmds.Quaternions =
  bind(VanillaSymbol,'\\mathbb{H}','&#8461;');

//spacing
LatexCmds.quad = LatexCmds.emsp = bind(VanillaSymbol,'\\quad ','    ');
LatexCmds.qquad = bind(VanillaSymbol,'\\qquad ','        ');
/* spacing special characters, gonna have to implement this in LatexCommandInput::textInput somehow
case ',':
  return new VanillaSymbol('\\, ',' ');
case ':':
  return new VanillaSymbol('\\: ','  ');
case ';':
  return new VanillaSymbol('\\; ','   ');
case '!':
  return new Symbol('\\! ','<span style="margin-right:-.2em"></span>');
*/

//binary operators
LatexCmds.diamond = bind(VanillaSymbol, '\\diamond ', '&#9671;');
LatexCmds.bigtriangleup = bind(VanillaSymbol, '\\bigtriangleup ', '&#9651;');
LatexCmds.ominus = bind(VanillaSymbol, '\\ominus ', '&#8854;');
LatexCmds.uplus = bind(VanillaSymbol, '\\uplus ', '&#8846;');
LatexCmds.bigtriangledown = bind(VanillaSymbol, '\\bigtriangledown ', '&#9661;');
LatexCmds.sqcap = bind(VanillaSymbol, '\\sqcap ', '&#8851;');
LatexCmds.triangleleft = bind(VanillaSymbol, '\\triangleleft ', '&#8882;');
LatexCmds.sqcup = bind(VanillaSymbol, '\\sqcup ', '&#8852;');
LatexCmds.triangleright = bind(VanillaSymbol, '\\triangleright ', '&#8883;');
LatexCmds.odot = bind(VanillaSymbol, '\\odot ', '&#8857;');
LatexCmds.bigcirc = bind(VanillaSymbol, '\\bigcirc ', '&#9711;');
LatexCmds.dagger = bind(VanillaSymbol, '\\dagger ', '&#0134;');
LatexCmds.ddagger = bind(VanillaSymbol, '\\ddagger ', '&#135;');
LatexCmds.wr = bind(VanillaSymbol, '\\wr ', '&#8768;');
LatexCmds.amalg = bind(VanillaSymbol, '\\amalg ', '&#8720;');

//relationship symbols
LatexCmds.models = bind(VanillaSymbol, '\\models ', '&#8872;');
LatexCmds.prec = bind(VanillaSymbol, '\\prec ', '&#8826;');
LatexCmds.succ = bind(VanillaSymbol, '\\succ ', '&#8827;');
LatexCmds.preceq = bind(VanillaSymbol, '\\preceq ', '&#8828;');
LatexCmds.succeq = bind(VanillaSymbol, '\\succeq ', '&#8829;');
LatexCmds.simeq = bind(VanillaSymbol, '\\simeq ', '&#8771;');
LatexCmds.mid = bind(VanillaSymbol, '\\mid ', '&#8739;');
LatexCmds.ll = bind(VanillaSymbol, '\\ll ', '&#8810;');
LatexCmds.gg = bind(VanillaSymbol, '\\gg ', '&#8811;');
LatexCmds.parallel = bind(VanillaSymbol, '\\parallel ', '&#8741;');
LatexCmds.bowtie = bind(VanillaSymbol, '\\bowtie ', '&#8904;');
LatexCmds.sqsubset = bind(VanillaSymbol, '\\sqsubset ', '&#8847;');
LatexCmds.sqsupset = bind(VanillaSymbol, '\\sqsupset ', '&#8848;');
LatexCmds.smile = bind(VanillaSymbol, '\\smile ', '&#8995;');
LatexCmds.sqsubseteq = bind(VanillaSymbol, '\\sqsubseteq ', '&#8849;');
LatexCmds.sqsupseteq = bind(VanillaSymbol, '\\sqsupseteq ', '&#8850;');
LatexCmds.doteq = bind(VanillaSymbol, '\\doteq ', '&#8784;');
LatexCmds.frown = bind(VanillaSymbol, '\\frown ', '&#8994;');
LatexCmds.vdash = bind(VanillaSymbol, '\\vdash ', '&#8870;');
LatexCmds.dashv = bind(VanillaSymbol, '\\dashv ', '&#8867;');

//arrows
LatexCmds.longleftarrow = bind(VanillaSymbol, '\\longleftarrow ', '&#8592;');
LatexCmds.longrightarrow = bind(VanillaSymbol, '\\longrightarrow ', '&#8594;');
LatexCmds.Longleftarrow = bind(VanillaSymbol, '\\Longleftarrow ', '&#8656;');
LatexCmds.Longrightarrow = bind(VanillaSymbol, '\\Longrightarrow ', '&#8658;');
LatexCmds.longleftrightarrow = bind(VanillaSymbol, '\\longleftrightarrow ', '&#8596;');
LatexCmds.updownarrow = bind(VanillaSymbol, '\\updownarrow ', '&#8597;');
LatexCmds.Longleftrightarrow = bind(VanillaSymbol, '\\Longleftrightarrow ', '&#8660;');
LatexCmds.Updownarrow = bind(VanillaSymbol, '\\Updownarrow ', '&#8661;');
LatexCmds.mapsto = bind(VanillaSymbol, '\\mapsto ', '&#8614;');
LatexCmds.nearrow = bind(VanillaSymbol, '\\nearrow ', '&#8599;');
LatexCmds.hookleftarrow = bind(VanillaSymbol, '\\hookleftarrow ', '&#8617;');
LatexCmds.hookrightarrow = bind(VanillaSymbol, '\\hookrightarrow ', '&#8618;');
LatexCmds.searrow = bind(VanillaSymbol, '\\searrow ', '&#8600;');
LatexCmds.leftharpoonup = bind(VanillaSymbol, '\\leftharpoonup ', '&#8636;');
LatexCmds.rightharpoonup = bind(VanillaSymbol, '\\rightharpoonup ', '&#8640;');
LatexCmds.swarrow = bind(VanillaSymbol, '\\swarrow ', '&#8601;');
LatexCmds.leftharpoondown = bind(VanillaSymbol, '\\leftharpoondown ', '&#8637;');
LatexCmds.rightharpoondown = bind(VanillaSymbol, '\\rightharpoondown ', '&#8641;');
LatexCmds.nwarrow = bind(VanillaSymbol, '\\nwarrow ', '&#8598;');

//Misc
LatexCmds.ldots = bind(VanillaSymbol, '\\ldots ', '&#8230;');
LatexCmds.cdots = bind(VanillaSymbol, '\\cdots ', '&#8943;');
LatexCmds.vdots = bind(VanillaSymbol, '\\vdots ', '&#8942;');
LatexCmds.ddots = bind(VanillaSymbol, '\\ddots ', '&#8944;');
LatexCmds.surd = bind(VanillaSymbol, '\\surd ', '&#8730;');
LatexCmds.triangle = bind(VanillaSymbol, '\\triangle ', '&#9653;');
LatexCmds.ell = bind(VanillaSymbol, '\\ell ', '&#8467;');
LatexCmds.top = bind(VanillaSymbol, '\\top ', '&#8868;');
LatexCmds.flat = bind(VanillaSymbol, '\\flat ', '&#9837;');
LatexCmds.natural = bind(VanillaSymbol, '\\natural ', '&#9838;');
LatexCmds.sharp = bind(VanillaSymbol, '\\sharp ', '&#9839;');
LatexCmds.wp = bind(VanillaSymbol, '\\wp ', '&#8472;');
LatexCmds.bot = bind(VanillaSymbol, '\\bot ', '&#8869;');
LatexCmds.clubsuit = bind(VanillaSymbol, '\\clubsuit ', '&#9827;');
LatexCmds.diamondsuit = bind(VanillaSymbol, '\\diamondsuit ', '&#9826;');
LatexCmds.heartsuit = bind(VanillaSymbol, '\\heartsuit ', '&#9825;');
LatexCmds.spadesuit = bind(VanillaSymbol, '\\spadesuit ', '&#9824;');

//variable-sized
LatexCmds.oint = bind(VanillaSymbol, '\\oint ', '&#8750;');
LatexCmds.bigcap = bind(VanillaSymbol, '\\bigcap ', '&#8745;');
LatexCmds.bigcup = bind(VanillaSymbol, '\\bigcup ', '&#8746;');
LatexCmds.bigsqcup = bind(VanillaSymbol, '\\bigsqcup ', '&#8852;');
LatexCmds.bigvee = bind(VanillaSymbol, '\\bigvee ', '&#8744;');
LatexCmds.bigwedge = bind(VanillaSymbol, '\\bigwedge ', '&#8743;');
LatexCmds.bigodot = bind(VanillaSymbol, '\\bigodot ', '&#8857;');
LatexCmds.bigotimes = bind(VanillaSymbol, '\\bigotimes ', '&#8855;');
LatexCmds.bigoplus = bind(VanillaSymbol, '\\bigoplus ', '&#8853;');
LatexCmds.biguplus = bind(VanillaSymbol, '\\biguplus ', '&#8846;');

//delimiters
LatexCmds.lfloor = bind(VanillaSymbol, '\\lfloor ', '&#8970;');
LatexCmds.rfloor = bind(VanillaSymbol, '\\rfloor ', '&#8971;');
LatexCmds.lceil = bind(VanillaSymbol, '\\lceil ', '&#8968;');
LatexCmds.rceil = bind(VanillaSymbol, '\\rceil ', '&#8969;');
LatexCmds.slash = bind(VanillaSymbol, '\\slash ', '&#47;');
LatexCmds.opencurlybrace = bind(VanillaSymbol, '\\opencurlybrace ', '&#123;');
LatexCmds.closecurlybrace = bind(VanillaSymbol, '\\closecurlybrace ', '&#125;');

//various symbols

LatexCmds.caret = bind(VanillaSymbol,'\\caret ','^');
LatexCmds.underscore = bind(VanillaSymbol,'\\underscore ','_');
LatexCmds.backslash = bind(VanillaSymbol,'\\backslash ','\\');
LatexCmds.vert = bind(VanillaSymbol,'|');
LatexCmds.perp = LatexCmds.perpendicular = bind(VanillaSymbol,'\\perp ','&perp;');
LatexCmds.nabla = LatexCmds.del = bind(VanillaSymbol,'\\nabla ','&nabla;');
LatexCmds.hbar = bind(VanillaSymbol,'\\hbar ','&#8463;');

LatexCmds.AA = LatexCmds.Angstrom = LatexCmds.angstrom =
  bind(VanillaSymbol,'\\text\\AA ','&#8491;');

LatexCmds.ring = LatexCmds.circ = LatexCmds.circle =
  bind(VanillaSymbol,'\\circ ','&#8728;');

LatexCmds.bull = LatexCmds.bullet = bind(VanillaSymbol,'\\bullet ','&bull;');

LatexCmds.setminus = LatexCmds.smallsetminus =
  bind(VanillaSymbol,'\\setminus ','&#8726;');

LatexCmds.not = //bind(Symbol,'\\not ','<span class="not">/</span>');
LatexCmds['¬'] = LatexCmds.neg = bind(VanillaSymbol,'\\neg ','&not;');

LatexCmds['…'] = LatexCmds.dots = LatexCmds.ellip = LatexCmds.hellip =
LatexCmds.ellipsis = LatexCmds.hellipsis =
  bind(VanillaSymbol,'\\dots ','&hellip;');

LatexCmds.converges =
LatexCmds.darr = LatexCmds.dnarr = LatexCmds.dnarrow = LatexCmds.downarrow =
  bind(VanillaSymbol,'\\downarrow ','&darr;');

LatexCmds.dArr = LatexCmds.dnArr = LatexCmds.dnArrow = LatexCmds.Downarrow =
  bind(VanillaSymbol,'\\Downarrow ','&dArr;');

LatexCmds.diverges = LatexCmds.uarr = LatexCmds.uparrow =
  bind(VanillaSymbol,'\\uparrow ','&uarr;');

LatexCmds.uArr = LatexCmds.Uparrow = bind(VanillaSymbol,'\\Uparrow ','&uArr;');

LatexCmds.to = bind(BinaryOperator,'\\to ','&rarr;');

LatexCmds.rarr = LatexCmds.rightarrow = bind(VanillaSymbol,'\\rightarrow ','&rarr;');

LatexCmds.implies = bind(BinaryOperator,'\\Rightarrow ','&rArr;');

LatexCmds.rArr = LatexCmds.Rightarrow = bind(VanillaSymbol,'\\Rightarrow ','&rArr;');

LatexCmds.gets = bind(BinaryOperator,'\\gets ','&larr;');

LatexCmds.larr = LatexCmds.leftarrow = bind(VanillaSymbol,'\\leftarrow ','&larr;');

LatexCmds.impliedby = bind(BinaryOperator,'\\Leftarrow ','&lArr;');

LatexCmds.lArr = LatexCmds.Leftarrow = bind(VanillaSymbol,'\\Leftarrow ','&lArr;');

LatexCmds.harr = LatexCmds.lrarr = LatexCmds.leftrightarrow =
  bind(VanillaSymbol,'\\leftrightarrow ','&harr;');

LatexCmds.iff = bind(BinaryOperator,'\\Leftrightarrow ','&hArr;');

LatexCmds.hArr = LatexCmds.lrArr = LatexCmds.Leftrightarrow =
  bind(VanillaSymbol,'\\Leftrightarrow ','&hArr;');

LatexCmds.Re = LatexCmds.Real = LatexCmds.real = bind(VanillaSymbol,'\\Re ','&real;');

LatexCmds.Im = LatexCmds.imag =
LatexCmds.image = LatexCmds.imagin = LatexCmds.imaginary = LatexCmds.Imaginary =
  bind(VanillaSymbol,'\\Im ','&image;');

LatexCmds.part = LatexCmds.partial = bind(VanillaSymbol,'\\partial ','&part;');

LatexCmds.inf = LatexCmds.infin = LatexCmds.infty = LatexCmds.infinity =
  bind(VanillaSymbol,'\\infty ','&infin;');

LatexCmds.alef = LatexCmds.alefsym = LatexCmds.aleph = LatexCmds.alephsym =
  bind(VanillaSymbol,'\\aleph ','&alefsym;');

LatexCmds.xist = //LOL
LatexCmds.xists = LatexCmds.exist = LatexCmds.exists =
  bind(VanillaSymbol,'\\exists ','&exist;');

LatexCmds.and = LatexCmds.land = LatexCmds.wedge =
  bind(VanillaSymbol,'\\wedge ','&and;');

LatexCmds.or = LatexCmds.lor = LatexCmds.vee = bind(VanillaSymbol,'\\vee ','&or;');

LatexCmds.o = LatexCmds.O =
LatexCmds.empty = LatexCmds.emptyset =
LatexCmds.oslash = LatexCmds.Oslash =
LatexCmds.nothing = LatexCmds.varnothing =
  bind(BinaryOperator,'\\varnothing ','&empty;');

LatexCmds.cup = LatexCmds.union = bind(VanillaSymbol,'\\cup ','&cup;');

LatexCmds.cap = LatexCmds.intersect = LatexCmds.intersection =
  bind(VanillaSymbol,'\\cap ','&cap;');

LatexCmds.deg = LatexCmds.degree = bind(VanillaSymbol,'^\\circ ','&deg;');

LatexCmds.ang = LatexCmds.angle = bind(VanillaSymbol,'\\angle ','&ang;');


function NonItalicizedFunction(replacedFragment, fn) {
  Symbol.call(this, '\\'+fn+' ', '<span>'+fn+'</span>');
}
_ = NonItalicizedFunction.prototype = new Symbol;
_.respace = function()
{
  this.jQ[0].className =
    (this.next instanceof SupSub || this.next instanceof Bracket) ?
    '' : 'non-italicized-function';
};

LatexCmds.ln =
LatexCmds.lg =
LatexCmds.log =
LatexCmds.span =
LatexCmds.proj =
LatexCmds.det =
LatexCmds.dim =
LatexCmds.min =
LatexCmds.max =
LatexCmds.mod =
LatexCmds.lcm =
LatexCmds.gcd =
LatexCmds.gcf =
LatexCmds.hcf =
LatexCmds.lim = NonItalicizedFunction;

(function() {
  var trig = ['sin', 'cos', 'tan', 'sec', 'cosec', 'csc', 'cotan', 'cot'];
  for (var i in trig) {
    LatexCmds[trig[i]] =
    LatexCmds[trig[i]+'h'] =
    LatexCmds['a'+trig[i]] = LatexCmds['arc'+trig[i]] =
    LatexCmds['a'+trig[i]+'h'] = LatexCmds['arc'+trig[i]+'h'] =
      NonItalicizedFunction;
  }
}());

