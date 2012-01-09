/********************************************
 * Cursor and Selection "singleton" classes
 *******************************************/

/* The main thing that manipulates the Math DOM. Makes sure to manipulate the
HTML DOM to match. */

/* Sort of singletons, since there should only be one per editable math
textbox, but any one HTML document can contain many such textboxes, so any one
JS environment could actually contain many instances. */

//A fake cursor in the fake textbox that the math is rendered in.
function Cursor(root) {
  this.parent = this.root = root;
  var jQ = this.jQ = this._jQ = $('<span class="cursor">&zwj;</span>');

  //closured for setInterval
  this.blink = function(){ jQ.toggleClass('blink'); }
}
_ = Cursor.prototype;
_.prev = 0;
_.next = 0;
_.parent = 0;
_.show = function() {
  this.jQ = this._jQ.removeClass('blink');
  if ('intervalId' in this) //already was shown, just restart interval
    clearInterval(this.intervalId);
  else { //was hidden and detached, insert this.jQ back into HTML DOM
    if (this.next) {
      if (this.selection && this.selection.prev === this.prev)
        this.jQ.insertBefore(this.selection.jQ);
      else
        this.jQ.insertBefore(this.next.jQ.first());
    }
    else
      this.jQ.appendTo(this.parent.jQ);
    this.parent.focus();
  }
  this.intervalId = setInterval(this.blink, 500);
  return this;
};
_.hide = function() {
  if ('intervalId' in this)
    clearInterval(this.intervalId);
  delete this.intervalId;
  this.jQ.detach();
  this.jQ = $();
  return this;
};
_.redraw = function() {
  for (var ancestor = this.parent; ancestor; ancestor = ancestor.parent)
    if (ancestor.redraw)
      ancestor.redraw();
};
_.insertAt = function(parent, prev, next) {
  var old_parent = this.parent;

  this.parent = parent;
  this.prev = prev;
  this.next = next;

  old_parent.blur(); //blur may need to know cursor's destination
};
_.insertBefore = function(el) {
  this.insertAt(el.parent, el.prev, el)
  this.parent.jQ.addClass('hasCursor');
  this.jQ.insertBefore(el.jQ.first());
  return this;
};
_.insertAfter = function(el) {
  this.insertAt(el.parent, el, el.next);
  this.parent.jQ.addClass('hasCursor');
  this.jQ.insertAfter(el.jQ.last());
  return this;
};
_.prependTo = function(el) {
  this.insertAt(el, 0, el.firstChild);
  if (el.textarea) //never insert before textarea
    this.jQ.insertAfter(el.textarea);
  else
    this.jQ.prependTo(el.jQ);
  el.focus();
  return this;
};
_.appendTo = function(el) {
  this.insertAt(el, el.lastChild, 0);
  this.jQ.appendTo(el.jQ);
  el.focus();
  return this;
};
_.hopLeft = function() {
  this.jQ.insertBefore(this.prev.jQ.first());
  this.next = this.prev;
  this.prev = this.prev.prev;
  return this;
};
_.hopRight = function() {
  this.jQ.insertAfter(this.next.jQ.last());
  this.prev = this.next;
  this.next = this.next.next;
  return this;
};
_.moveLeft = function() {
  if (this.selection)
    this.insertBefore(this.selection.prev.next || this.parent.firstChild).clearSelection();
  else {
    this.checkFunctionName();
    if (this.prev) {
      if (this.prev.lastChild)
        this.appendTo(this.prev.lastChild)
      else
        this.hopLeft();
    }
    else { //we're at the beginning of a block
      if (this.parent.prev)
        this.appendTo(this.parent.prev);
      else if (this.parent !== this.root)
        this.insertBefore(this.parent.parent);
      //else we're at the beginning of the root, so do nothing.
    }
  }
  return this.show();
};
_.moveRight = function() {
  if (this.selection)
    this.insertAfter(this.selection.next.prev || this.parent.lastChild).clearSelection();
  else {
    this.checkFunctionName();
    if (this.next) {
      if (this.next.firstChild)
        this.prependTo(this.next.firstChild)
      else
        this.hopRight();
    }
    else { //we're at the end of a block
      if (this.parent.next)
        this.prependTo(this.parent.next);
      else if (this.parent !== this.root)
        this.insertAfter(this.parent.parent);
      //else we're at the end of the root, so do nothing.
    }
  }
  return this.show();
};
_.seek = function(target, pageX, pageY) {
  this.checkFunctionName();
  var cursor = this.clearSelection();
  if (target.hasClass('empty')) {
    cursor.prependTo(target.data(jQueryDataKey).block);
    return cursor;
  }

  var data = target.data(jQueryDataKey);
  if (data) {
    //if clicked a symbol, insert at whichever side is closer
    if (data.cmd && !data.block) {
      if (target.outerWidth() > 2*(pageX - target.offset().left))
        cursor.insertBefore(data.cmd);
      else
        cursor.insertAfter(data.cmd);

      return cursor;
    }
  }
  //if no MathQuill data, try parent, if still no, forget it
  else {
    target = target.parent();
    data = target.data(jQueryDataKey);
    if (!data)
      data = {block: cursor.root};
  }

  if (data.cmd)
    cursor.insertAfter(data.cmd);
  else
    cursor.appendTo(data.block);

  //move cursor to position closest to click
  var dist = cursor.jQ.offset().left - pageX, prevDist;
  do {
    cursor.moveLeft();
    prevDist = dist;
    dist = cursor.jQ.offset().left - pageX;
  }
  while (dist > 0 && (cursor.prev || cursor.parent !== cursor.root));

  if (-dist > prevDist)
    cursor.moveRight();

  return cursor;
};
_.writeLatex = function(latex) {
  this.deleteSelection();
  latex = ( latex && latex.match(/\\text\{([^}]|\\\})*\}|\\[a-z]*|[^\s]/ig) ) || 0;
  (function writeLatexBlock(cursor) {
    while (latex.length) {
      var token = latex.shift(); //pop first item
      if (!token || token === '}') return;

      var cmd;
      if (token.slice(0, 6) === '\\text{') {
        cmd = new TextBlock(token.slice(6, -1));
        cursor.insertNew(cmd).insertAfter(cmd);
        continue; //skip recursing through children
      }
      else if (token === '\\left' || token === '\\right') { //FIXME HACK: implement real \left and \right LaTeX commands, rather than special casing them here
        token = latex.shift();
        if (token === '\\')
          token = latex.shift();

        cursor.insertCh(token);
        cmd = cursor.prev || cursor.parent.parent;

        if (cursor.prev) //was a close-paren, so break recursion
          return;
        else //was an open-paren, hack to put the following latex
          latex.unshift('{'); //in the ParenBlock in the math DOM
      }
      else if (/^\\[a-z]+$/i.test(token)) {
        token = token.slice(1);
        var cmd = LatexCmds[token];
        if (cmd) {
          cursor.insertNew(cmd = new cmd(undefined, token));
          //delete extra closing parenthesis that are added when pasting
          //latex content that includes functions. There has to be a better way
          //to deal with this issue
          if (this.isAcceptedCmd(token)) {
             latex.shift();
             var count = 0;
             for (var iPos = 0; iPos < latex.length; iPos++) {
                if (latex[iPos] == "(")
                   count++;
                if (latex[iPos] == ")")
                   count--;
                if (count < 0) {
                   latex = latex.slice(0, iPos).concat(latex.slice(iPos + 1, latex.length));
                   break;
                }
             }
          }
        }
        else {
          cmd = new TextBlock(token);
          cursor.insertNew(cmd).insertAfter(cmd);
          continue; //skip recursing through children
        }
      }
      else {
        if (token.match(/[a-eg-zA-Z]/)) //exclude f because want florin
          cmd = new Variable(token);
        else if (cmd = LatexCmds[token])
          cmd = new cmd;
        else
          cmd = new VanillaSymbol(token);

        cursor.insertNew(cmd);
      }
      cmd.eachChild(function(child) {
        cursor.appendTo(child);
        var token = latex.shift();
        if (!token) return false;

        if (token === '{')
          writeLatexBlock(cursor);
        else
          cursor.insertCh(token);
      });
      cursor.insertAfter(cmd);
    }
  }(this));
  return this.hide();
};
_.write = function(ch) {
  return this.show().insertCh(ch);
};

_.checkFunctionName = function(ch) {
  if (this.checking)
     return true;
  this.checking = true;
  var name = "";
  var start = this.prev;
  var cmd;
  var cmdPrev;
  var cmdName;
  while (start && (start instanceof Variable)) {
    name = start.text_template + name;
    if (this.isAcceptedCmd(name)) {
       cmd = LatexCmds[name];
       cmdPrev = start.prev;
       cmdName = name;
    }
    start = start.prev;
  }
  var keepCh = true;
  if ((cmd) && (!this.isAcceptedCmd(cmdName + ch))) {
     while (this.prev != cmdPrev)
        this.prev = this.prev.remove().prev;
     this.insertCh(cmdName);
     if (ch == "(")
        keepCh = false;
  }
  this.checking = false;
  return keepCh;
}
_.insertCh = function(ch) {
  if (this.selection) {
    //gotta do this before this.selection is mutated by 'new cmd(this.selection)'
    this.prev = this.selection.prev;
    this.next = this.selection.next;
  }
  else
    if (!this.checkFunctionName(ch))
      return this;
  var cmd;
  if (ch.match(/^[a-eg-zA-Z]$/)) //exclude f because want florin
    cmd = new Variable(ch);
  else if ((cmd = CharCmds[ch]) && (this.isAcceptedCmd(ch)))
    cmd = new cmd(this.selection, ch);
  else if ((cmd = LatexCmds[ch]) && (this.isAcceptedCmd(ch)))
    cmd = new cmd(this.selection, ch);
  else if ((ch.charAt(0) == "²") && (this.isAcceptedCmd("^"))) {
     this.insertCh("^");
     cmd = new VanillaSymbol("2");
  }
  else if ((ch.match(/^[0-9.]$/)) | (this.isAcceptedCmd(ch)))
    cmd = new VanillaSymbol(ch);
  else
    return this;

  if (this.selection) {
    if (cmd instanceof Symbol)
      this.selection.remove();
    delete this.selection;
  }

  return this.insertNew(cmd);
};
_.insertNew = function(cmd) {
  cmd.insertAt(this);
  return this;
};
_.getCmdType = function(cmd) {
   if (!cmd)
      return "NO";
   if (cmd instanceof SupSub) {
      if (cmd.cmd == "^")
         return "SP";
      else
         return "SB";
   }
   if (cmd instanceof BinaryOperator) {
      if (cmd.cmd === "-")
         return "UN";
      return "OP";
   }
   if (cmd instanceof VanillaSymbol) {
      var value = cmd.text_template;
      if (value == "")
         return "PH";
      if (value == ".")
         return "PT";
      if ((value >= 0) && (value <= 9))
         return "NB";
   }
   return "VA";
}
_.insertPlaceholderIfNeeded = function(stayLeft) {
  while (this.getCmdType(this.next) == "PH")
     this.next = this.next.remove().next;
  while (this.getCmdType(this.prev) == "PH")
     this.prev = this.prev.remove().prev
  var typeNext = this.getCmdType(this.next);
  var typePrev = this.getCmdType(this.prev);

  var actions = {
     "VA": {"VA":0, "NB":1, "OP":0, "UN":0, "NO":0, "PT":1, "SP":0, "SB":0},
     "NB": {"VA":0, "NB":0, "OP":0, "UN":0, "NO":0, "PT":0, "SP":0, "SB":0},
     "OP": {"VA":0, "NB":0, "OP":1, "UN":0, "NO":1, "PT":1, "SP":1, "SB":1},
     "UN": {"VA":0, "NB":0, "OP":1, "UN":1, "NO":1, "PT":1, "SP":1, "SB":1},
     "NO": {"VA":0, "NB":0, "OP":1, "UN":0, "NO":1, "PT":1, "SP":1, "SB":1},
     "PT": {"VA":1, "NB":0, "OP":1, "UN":1, "NO":1, "PT":2, "SP":1, "SB":1},
     "SP": {"VA":0, "NB":1, "OP":0, "UN":0, "NO":0, "PT":1, "SP":1, "SB":1},
     "SB": {"VA":0, "NB":1, "OP":0, "UN":0, "NO":0, "PT":1, "SP":0, "SB":1},
  };
  switch(actions[typePrev][typeNext]) {
    case 0:
      break;
    case 1:
      //this.show();
      var cmd = new VanillaSymbol('', "<span class='block empty'></span>");
      cmd.insertAt(this);
      if (stayLeft)
        this.hopLeft();
      break;
    case 2:
      this.prev = this.prev.remove().prev;
      break;
  }
}
_.checkPlaceholder = function(onLeft, onRight) {
  if (this.checking)
    return;
  this.checking = true;
  if (onLeft) {
    this.hopLeft();
    this.insertPlaceholderIfNeeded(false)
    this.hopRight();
  }
  if (onRight) {
    this.insertPlaceholderIfNeeded(true);
  }
  this.checking = false;
}
_.selectToValidate = function() {
   if (this.checking)
      return;
   this.checking = true;
   var cmdType = this.getCmdType(this.selection.prev.next);
   while ((cmdType == "OP") || (cmdType == "PT") || (cmdType == "SP") || (cmdType == "SB")) {
     if (this.prev == this.selection.prev)
        this.selectLeft();
     else {
        this.selection.prev.jQ.prependTo(this.selection.jQ);
        this.selection.prev = this.selection.prev.prev;
     }
     if (!this.selection.prev)
       break;
     cmdType = this.getCmdType(this.selection.prev.next);
   }
   cmdType = this.getCmdType(this.selection.next.prev);
   cmdTypeNext = this.getCmdType(this.selection.next);
   while ((cmdType == "OP") || (cmdType == "PT") || (cmdTypeNext == "SP")|| (cmdTypeNext == "SB")) {
     if (this.next == this.selection.next)
        this.selectRight();
     else {
        this.selection.next.jQ.appendTo(this.selection.jQ);
        this.selection.next = this.selection.next.next;
      }
      if (!this.selection.next)
        break;
      cmdType = this.getCmdType(this.selection.next.prev);
      cmdTypeNext = this.getCmdType(this.selection.next);
   }
   this.checking = false;
}
_.retractLeftToValidate = function() {
  var cmdType = this.getCmdType(this.selection.next.prev);
  while ((cmdType == "OP") || (cmdType == "PT")) {
    this.prev.jQ.insertAfter(this.selection.jQ);
    this.hopLeft().selection.next = this.next;
    if (this.selection.prev === this.prev) {
      this.deleteSelection();
      return false;
    }
    if (!this.selection.next)
       return true;
    cmdType = this.getCmdType(this.selection.next.prev);
  }
  return true;
}
_.retractRightToValidate = function() {
  var cmdType = this.getCmdType(this.selection.prev.next);
  while ((cmdType == "OP") || (cmdType == "PT") || (cmdType == "SP") || (cmdType == "SB")) {
    this.next.jQ.insertBefore(this.selection.jQ);
    this.hopRight().selection.prev = this.prev;
    if (this.selection.next === this.next) {
      this.deleteSelection();
      return false;
    }
    if (!this.selection.prev)
       return true;
    cmdType = this.getCmdType(this.selection.prev.next);
  }
  return true;
}
_.unwrapGramp = function() {
  var gramp = this.parent.parent,
    greatgramp = gramp.parent,
    prev = gramp.prev,
    cursor = this;

  gramp.eachChild(function(uncle) {
    if (uncle.isEmpty()) return;

    uncle.eachChild(function(cousin) {
      cousin.parent = greatgramp;
      cousin.jQ.insertBefore(gramp.jQ.first());
    });
    uncle.firstChild.prev = prev;
    if (prev)
      prev.next = uncle.firstChild;
    else
      greatgramp.firstChild = uncle.firstChild;

    prev = uncle.lastChild;
  });
  prev.next = gramp.next;
  if (gramp.next)
    gramp.next.prev = prev;
  else
    greatgramp.lastChild = prev;

  if (!this.next) { //then find something to be next to insertBefore
    if (this.prev)
      this.next = this.prev.next;
    else {
      while (!this.next) {
        this.parent = this.parent.next;
        if (this.parent)
          this.next = this.parent.firstChild;
        else {
          this.next = gramp.next;
          this.parent = greatgramp;
          break;
        }
      }
    }
  }
  if (this.next)
    this.insertBefore(this.next);
  else
    this.appendTo(greatgramp);

  gramp.jQ.remove();

  if (gramp.prev)
    gramp.prev.respace();
  if (gramp.next)
    gramp.next.respace();
};
_.backspace = function() {
  if (this.deleteSelection());
  else if (this.prev) {
    if (this.prev.isEmpty())
      this.prev = this.prev.remove().prev;
    else
      this.selectLeft();
  }
  else if (this.parent !== this.root) {
    if (this.parent.parent.isEmpty())
      return this.insertAfter(this.parent.parent).backspace();
    else
      this.unwrapGramp();
  }
  this.checkPlaceholder(false, true);

  if (this.prev)
    this.prev.respace();
  if (this.next)
    this.next.respace();
  this.redraw();

  return this;
};
_.deleteForward = function() {
  if (this.deleteSelection());
  else if (this.next) {
    if (this.next.isEmpty())
      this.next = this.next.remove().next;
    else
      this.selectRight();
  }
  else if (this.parent !== this.root) {
    if (this.parent.parent.isEmpty())
      return this.insertBefore(this.parent.parent).deleteForward();
    else
      this.unwrapGramp();
  }
  this.checkPlaceholder(false, true);

  if (this.prev)
    this.prev.respace();
  if (this.next)
    this.next.respace();
  this.redraw();

  return this;
};
_.selectFrom = function(anticursor) {
  //find ancestors of each with common parent
  var oneA = this, otherA = anticursor; //one ancestor, the other ancestor
  loopThroughAncestors: while (true) {
    for (var oneI = this; oneI !== oneA.parent.parent; oneI = oneI.parent.parent) //one intermediate, the other intermediate
      if (oneI.parent === otherA.parent) {
        left = oneI;
        right = otherA;
        break loopThroughAncestors;
      }

    for (var otherI = anticursor; otherI !== otherA.parent.parent; otherI = otherI.parent.parent)
      if (oneA.parent === otherI.parent) {
        left = oneA;
        right = otherI;
        break loopThroughAncestors;
      }

    if (oneA.parent.parent)
      oneA = oneA.parent.parent;
    if (otherA.parent.parent)
      otherA = otherA.parent.parent;
  }
  //figure out which is left/prev and which is right/next
  var left, right, leftRight;
  if (left.next !== right) {
    for (var next = left; next; next = next.next) {
      if (next === right.prev) {
        leftRight = true;
        break;
      }
    }
    if (!leftRight) {
      leftRight = right;
      right = left;
      left = leftRight;
    }
  }
  this.hide().selection = new Selection(
    left.parent,
    left.prev,
    right.next
  );
  this.insertAfter(right.next.prev || right.parent.lastChild);
  this.root.selectionChanged();
};
_.selectLeft = function() {
  if (this.selection) {
    if (this.selection.prev === this.prev) { //if cursor is at left edge of selection;
      if (this.prev) { //then extend left if possible
        this.hopLeft().next.jQ.prependTo(this.selection.jQ);
        this.selection.prev = this.prev;
      }
      else if (this.parent !== this.root) //else level up if possible
        this.insertBefore(this.parent.parent).selection.levelUp();
      this.selectToValidate()
    }
    else { //else cursor is at right edge of selection, retract left
      this.prev.jQ.insertAfter(this.selection.jQ);
      this.hopLeft().selection.next = this.next;
      if (this.selection.prev === this.prev) {
        this.deleteSelection();
        return;
      }
      if (!this.retractLeftToValidate())
        return;
    }
  }
  else {
    this.checkFunctionName();
    if (this.prev)
      this.hopLeft();
    else //end of a block
      if (this.parent !== this.root)
        this.insertBefore(this.parent.parent);
      else
        return;

    this.hide().selection = new Selection(this.parent, this.prev, this.next.next);
    this.selectToValidate()
  }
  this.root.selectionChanged();
};
_.selectRight = function() {
  if (this.selection) {
    if (this.selection.next === this.next) { //if cursor is at right edge of selection;
      if (this.next) { //then extend right if possible
        this.hopRight().prev.jQ.appendTo(this.selection.jQ);
        this.selection.next = this.next;
      }
      else if (this.parent !== this.root) //else level up if possible
        this.insertAfter(this.parent.parent).selection.levelUp();
      this.selectToValidate()
    }
    else { //else cursor is at left edge of selection, retract right
      this.next.jQ.insertBefore(this.selection.jQ);
      this.hopRight().selection.prev = this.prev;
      if (this.selection.next === this.next) {
        this.deleteSelection();
        return;
      }
      if (!this.retractRightToValidate())
        return;
    }
  }
  else {
    this.checkFunctionName();
    if (this.next)
      this.hopRight();
    else //end of a block
      if (this.parent !== this.root)
        this.insertAfter(this.parent.parent);
      else
        return;

    this.hide().selection = new Selection(this.parent, this.prev.prev, this.next);
    this.selectToValidate()
  }
  this.root.selectionChanged();
};
_.clearSelection = function() {
  if (this.show().selection) {
    this.selection.clear();
    delete this.selection;
    this.root.selectionChanged();
  }
  return this;
};
_.deleteSelection = function() {
  if (!this.show().selection) return false;

  this.prev = this.selection.prev;
  this.next = this.selection.next;
  this.selection.remove();
  delete this.selection;

  this.checkPlaceholder(false, true);
  this.root.selectionChanged();
  return true;
};
_.isAcceptedCmd = function(cmdStr) {
  if (this.root.acceptedCmds === undefined)
     return true;
  return (this.root.acceptedCmds[cmdStr] === 1);
}

function Selection(parent, prev, next) {
  MathFragment.apply(this, arguments);
}
_ = Selection.prototype = new MathFragment;
_.jQinit = function(children) {
  this.jQ = children.wrapAll('<span class="selection"></span>').parent();
    //can't do wrapAll(this.jQ = $(...)) because wrapAll will clone it
};
_.levelUp = function() {
  this.clear().jQinit(this.parent.parent.jQ);

  this.prev = this.parent.parent.prev;
  this.next = this.parent.parent.next;
  this.parent = this.parent.parent.parent;

  return this;
};
_.clear = function() {
  this.jQ.replaceWith(this.jQ.children());
  return this;
};
_.blockify = function() {
  this.jQ.replaceWith(this.jQ = this.jQ.children());
  return MathFragment.prototype.blockify.call(this);
};
_.detach = function() {
  var block = MathFragment.prototype.blockify.call(this);
  this.blockify = function() {
    this.jQ.replaceWith(block.jQ = this.jQ = this.jQ.children());
    return block;
  };
  return this;
};

