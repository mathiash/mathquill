var jQueryDataKey = '[[mathquill internal data]]';

function mathInsertCh(ch) {
   var editable = $('.mathquill-editable');
   var data = editable.data(jQueryDataKey);
   var block = data && data.block;
   var cursor = block && block.cursor;
   if (cursor) {
      cursor.write(ch);
      block.blur();
   }
   editable.focus();
}

function mathInsertFn(name) {
   var editable = $('.mathquill-editable');
   var data = editable.data(jQueryDataKey);
   var block = data && data.block;
   var cursor = block && block.cursor;
   if (cursor) {
      if (cursor.selection) {
         var prev = cursor.selection.prev;
         var next = cursor.selection.next;
         var parent = cursor.selection.parent;
         cursor.hide();
         var newNext = parent.firstChild;
         if (prev)
            newNext = prev.next;
         cursor.insertAt(parent, prev, newNext);
         cursor.show();
         mathInsertCh(name);
         cursor.hide();
         var newPrev = parent.lastChild;
         if (next)
            newPrev = next.prev;
         cursor.insertAt(parent, newPrev, next);
         cursor.show();
      }
      else {
	 mathInsertCh(name);
      }
      block.blur();
   }
   editable.focus();
}

function isValueClose(expr1, expr2, x) {
   var val1 = KhanUtil.exprCompute(expr1, {"x": x, "e":Math.E});
   var val2 = KhanUtil.exprCompute(expr2, {"x": x, "e":Math.E});
   if (isNaN(val1) && isNaN(val2))
      return true;
   var diff = val2 - val1;
   return (Math.abs(diff) < 0.001);
}

var mathquillCheckAnswer = function(solution) {
   var editable = $('.mathquill-editable');
   var data = editable.data(jQueryDataKey);
   var answer = data.block.expr();
   var xValues = [-2.1, -1.1, 0.1, 1.1, 2.1];
   for(var iValue = 0; xValues[iValue] !== undefined; iValue++) {
      if (!isValueClose(answer, solution, xValues[iValue])) {
         return false;
      }
   }
   return true;
};

var mathquillSetup = function(tableId, nbColumns, functions) {
    var data = {
    "sqrt": {html:"&radic;<span style='text-decoration:overline;'>&nbsp;</span>", callType:"Fn"},
    "sin": {html:"sin", callType:"Fn"},
    "cos": {html:"cos", callType:"Fn"},
    "tan": {html:"tan", callType:"Fn"},
    "sec": {html:"sec", callType:"Fn"},
    "ln": {html:"ln", callType:"Fn"},
    "^": {html:"x<sup>y</sup>", callType:"Ch"},
    "_": {html:"x<sub>i</sub>", callType:"Ch"},
    "(": {html:"(&nbsp;)", callType:"Ch"},
    };

    var col = 0;
    var tr = $("#"+tableId).find('tbody').append($('<tr>'));
    for (var iFn = 0; functions[iFn] !== undefined; iFn++) {
       var fn = functions[iFn];
       var fnData = data[functions[iFn]];
       if (col == nbColumns)
          tr = $("#"+tableId).find('tbody').append($('<tr>'));
       var clickCall = "mathInsert" + fnData.callType + "('" + functions[iFn] + "')";
       var td = tr.append("<td onclick=\""+clickCall+"\"><span class='button'>" + fnData.html + "</span></td>");
       col++;
    }
}


