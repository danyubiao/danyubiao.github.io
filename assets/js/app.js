/* 应用主控：导航、符号面板、绘制、保存、数据管理 */
(function () {
  'use strict';

  var equations = []; // {expr, color}
  var editingId = null;
  var currentInput = null;
  var colorIdx = 0;

  var COLORS = Grapher.COLORS;

  /* ---------- 工具 ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function toast(msg) {
    var t = el('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;top:64px;transform:translateX(-50%);background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;z-index:80;box-shadow:0 6px 20px rgba(0,0,0,.2);opacity:0;transition:opacity .2s;';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 250); }, 1600);
  }

  /* ---------- 导航 ---------- */
  function switchTab(name) {
    document.querySelectorAll('.page').forEach(function (p) { p.hidden = (p.dataset.page !== name); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.target === name); });
    if (name === 'data') renderData();
    if (name === 'grapher') doDraw();
  }
  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () { switchTab(t.dataset.target); });
  });

  /* ---------- 方程行 ---------- */
  function addEquation(expr, color) {
    var eq = { expr: expr || '', color: color || COLORS[colorIdx % COLORS.length] };
    colorIdx++;
    equations.push(eq);
    renderEquations();
    return eq;
  }
  function renderEquations() {
    var box = $('eqList');
    box.innerHTML = '';
    equations.forEach(function (eq, i) {
      var row = el('div', 'eq-row');
      var dot = el('span', 'eq-dot');
      dot.style.background = eq.color;
      var input = el('input');
      input.type = 'text';
      input.placeholder = '如 x^2 或 sin(x)';
      input.value = eq.expr;
      input.addEventListener('input', function () { eq.expr = input.value; });
      input.addEventListener('focus', function () { currentInput = input; });
      var del = el('button', 'eq-del');
      del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', function () {
        equations.splice(i, 1);
        if (equations.length === 0) addEquation('', COLORS[colorIdx % COLORS.length]);
        else renderEquations();
      });
      row.appendChild(dot); row.appendChild(input); row.appendChild(del);
      box.appendChild(row);
    });
  }

  $('addEq').addEventListener('click', function () { addEquation('', COLORS[colorIdx % COLORS.length]); });

  /* ---------- 符号面板 ---------- */
  var SYMBOLS = [
    { t: 'x', v: 'x', var: true }, { t: 'π', v: 'pi' }, { t: 'e', v: 'e' }, { t: 'y', v: 'y', var: true },
    { t: '+', v: '+', op: true }, { t: '−', v: '-', op: true }, { t: '×', v: '*', op: true }, { t: '÷', v: '/', op: true },
    { t: '^', v: '^', op: true }, { t: '(', v: '(', op: true }, { t: ')', v: ')', op: true }, { t: '.', v: '.', op: true },
    { t: 'x²', v: 'x^2', fn: true }, { t: '√', v: 'sqrt(', fn: true },
    { t: 'sin', v: 'sin(', fn: true }, { t: 'cos', v: 'cos(', fn: true },
    { t: 'tan', v: 'tan(', fn: true }, { t: 'asin', v: 'asin(', fn: true },
    { t: 'acos', v: 'acos(', fn: true }, { t: 'atan', v: 'atan(', fn: true },
    { t: 'ln', v: 'ln(', fn: true }, { t: 'log₁₀', v: 'log10(', fn: true },
    { t: 'abs', v: 'abs(', fn: true }, { t: 'exp', v: 'exp(', fn: true }
  ];
  function buildPalette() {
    var box = $('palette');
    SYMBOLS.forEach(function (s) {
      var cls = 'pal' + (s.fn ? ' fn' : '') + (s.var ? ' var' : '') + (s.op ? ' op' : '');
      var b = el('button', cls);
      b.textContent = s.t;
      b.title = s.op ? '运算符' : (s.var ? '变量' : (s.fn ? '函数' : ''));
      b.addEventListener('click', function () { insertSymbol(s.v); });
      box.appendChild(b);
    });
  }
  function insertSymbol(text) {
    var input = currentInput || (document.querySelector('.eq-row input'));
    if (!input) { addEquation(''); input = document.querySelector('.eq-row input'); }
    if (!input) return;
    var s = input.selectionStart, e = input.selectionEnd;
    var val = input.value;
    input.value = val.slice(0, s) + text + val.slice(e);
    var pos = s + text.length;
    input.selectionStart = input.selectionEnd = pos;
    input.focus();
    // 同步到 equations 模型
    var rows = document.querySelectorAll('.eq-row input');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] === input) { equations[i].expr = input.value; break; }
    }
  }
  buildPalette();

  /* ---------- 视图设置 ---------- */
  $('yAuto').addEventListener('change', function () {
    $('yManualRow').hidden = this.checked;
  });

  function getRanges() {
    return {
      xmin: parseFloat($('xMin').value),
      xmax: parseFloat($('xMax').value),
      yAuto: $('yAuto').checked,
      ymin: parseFloat($('yMin').value),
      ymax: parseFloat($('yMax').value)
    };
  }

  /* ---------- 绘制 ---------- */
  function collectEquations() {
    // 同步输入框最新值
    var rows = document.querySelectorAll('.eq-row input');
    rows.forEach(function (inp, i) { if (equations[i]) equations[i].expr = inp.value; });
    return equations.filter(function (eq) { return eq.expr && eq.expr.trim(); })
      .map(function (eq) { return { expr: eq.expr.trim(), color: eq.color }; });
  }

  function doDraw() {
    var r = getRanges();
    var eqs = collectEquations();
    if (eqs.length === 0) { $('plotStatus').textContent = '请至少输入一个方程'; return; }
    Grapher.draw($('plot'), {
      equations: eqs, xmin: r.xmin, xmax: r.xmax,
      yAuto: r.yAuto, ymin: r.ymin, ymax: r.ymax, statusEl: $('plotStatus')
    });
  }
  $('drawBtn').addEventListener('click', doDraw);

  $('fitBtn').addEventListener('click', function () {
    var r = getRanges();
    var eqs = collectEquations();
    if (eqs.length === 0) { $('plotStatus').textContent = '请先输入方程'; return; }
    var compiled = [];
    for (var i = 0; i < eqs.length; i++) {
      var c = Grapher.compile(eqs[i].expr);
      if (c.node) compiled.push(c);
    }
    if (!compiled.length) return;
    var ar = Grapher.autoRange(compiled, r.xmin, r.xmax);
    $('yAuto').checked = false;
    $('yManualRow').hidden = false;
    $('yMin').value = Math.round(ar.ymin * 100) / 100;
    $('yMax').value = Math.round(ar.ymax * 100) / 100;
    doDraw();
  });

  /* ---------- 保存 ---------- */
  function defaultName() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return '方程图 ' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  $('saveBtn').addEventListener('click', function () {
    var eqs = collectEquations();
    if (eqs.length === 0) { toast('没有可保存的方程'); return; }
    var r = getRanges();
    var base = $('eqName').value.trim() || defaultName();
    var name = base;
    // 新建保存（非编辑已有项）时若名称与已有条目重复，自动加序号，避免覆盖
    if (!editingId) {
      var all = Storage.list();
      var n = 2;
      while (all.some(function (it) { return it.name === name; })) {
        name = base + ' (' + n + ')';
        n++;
      }
    }
    var id = Storage.save({
      id: editingId || undefined,
      name: name,
      exprs: eqs,
      xmin: r.xmin, xmax: r.xmax, yAuto: r.yAuto, ymin: r.ymin, ymax: r.ymax
    });
    editingId = id;
    if (name !== base) $('eqName').value = name;
    toast('已保存到本地数据');
    renderDataCount();
  });

  /* ---------- 数据页 ---------- */
  function renderDataCount() {
    var n = Storage.list().length;
    $('dataCount').textContent = n + ' 条';
  }
  function renderData() {
    var list = Storage.list();
    renderDataCount();
    var box = $('dataList');
    box.innerHTML = '';
    $('dataEmpty').hidden = list.length > 0;
    list.forEach(function (it) {
      var item = el('div', 'data-item');
      var name = el('div', 'di-name');
      var dot = el('span', 'eq-dot');
      dot.style.background = (it.exprs[0] && it.exprs[0].color) || COLORS[0];
      name.appendChild(dot);
      name.appendChild(document.createTextNode(it.name));
      var expr = el('div', 'di-expr');
      expr.textContent = it.exprs.map(function (e) { return e.expr; }).join('  ；  ');
      var meta = el('div', 'di-meta');
      meta.textContent = '更新于 ' + new Date(it.updated).toLocaleString('zh-CN') +
        '  ·  X[' + it.xmin + ',' + it.xmax + ']';
      var actions = el('div', 'di-actions');
      var edit = el('button', 'btn btn-primary'); edit.textContent = '编辑';
      edit.addEventListener('click', function () { loadItem(it.id); });
      var del = el('button', 'btn btn-danger'); del.textContent = '删除';
      del.addEventListener('click', function () { confirmDelete(it); });
      actions.appendChild(edit); actions.appendChild(del);
      item.appendChild(name); item.appendChild(expr); item.appendChild(meta); item.appendChild(actions);
      box.appendChild(item);
    });
  }

  function loadItem(id) {
    var it = Storage.get(id);
    if (!it) return;
    editingId = id;
    $('eqName').value = it.name;
    equations = []; colorIdx = 0;
    it.exprs.forEach(function (e) { addEquation(e.expr, e.color); });
    if (equations.length === 0) addEquation('', COLORS[0]);
    $('xMin').value = it.xmin; $('xMax').value = it.xmax;
    $('yAuto').checked = !!it.yAuto;
    $('yManualRow').hidden = !!it.yAuto;
    if (!it.yAuto) { $('yMin').value = it.ymin; $('yMax').value = it.ymax; }
    switchTab('grapher');
    toast('已载入，可修改后重新保存');
  }

  /* ---------- 删除确认弹层 ---------- */
  var pendingDel = null;
  function confirmDelete(it) {
    pendingDel = it.id;
    $('sheetTitle').textContent = '删除数据';
    $('sheetBody').textContent = '确定删除「' + it.name + '」吗？此操作不可恢复。';
    $('sheetMask').hidden = false;
  }
  $('sheetCancel').addEventListener('click', function () { $('sheetMask').hidden = true; pendingDel = null; });
  $('sheetOk').addEventListener('click', function () {
    if (pendingDel) { Storage.remove(pendingDel); if (editingId === pendingDel) editingId = null; }
    $('sheetMask').hidden = true; pendingDel = null;
    renderData(); toast('已删除');
  });
  $('sheetMask').addEventListener('click', function (e) { if (e.target === this) { this.hidden = true; pendingDel = null; } });

  /* ---------- 使用帮助 ---------- */
  $('helpBtn').addEventListener('click', function () { $('helpMask').hidden = false; });
  $('helpClose').addEventListener('click', function () { $('helpMask').hidden = true; });
  $('helpMask').addEventListener('click', function (e) { if (e.target === this) { this.hidden = true; } });

  /* ---------- 初始化 ---------- */
  addEquation('x^2', COLORS[0]);
  addEquation('sin(x)', COLORS[1]);
  switchTab('grapher');

  // 窗口尺寸变化时重绘，保证画布清晰
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { if (!$('page-grapher').hidden) doDraw(); }, 200);
  });

  // 注册 Service Worker（离线可安装）
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('SW 注册失败', e); });
  }
})();
