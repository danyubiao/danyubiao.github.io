/* 方程绘图模块：解析表达式并在 xy 笛卡尔坐标系绘制曲线 */
(function (global) {
  'use strict';

  var FUNCS = {
    sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1,
    ln: 1, log: 1, log10: 1, sqrt: 1, abs: 1, exp: 1
  };

  // 让 math.js 支持 ln（自然对数）与 log10（常用对数）
  try {
    if (typeof math !== 'undefined') {
      var alias = {};
      if (math.ln === undefined) alias.ln = math.log;
      if (math.log10 === undefined) alias.log10 = function (x) { return math.log(x, 10); };
      if (Object.keys(alias).length) math.import(alias, { override: false, silent: true });
    }
  } catch (e) {}

  var COLORS = ['#2563eb', '#dc2626', '#0d9488', '#d97706', '#7c3aed', '#db2777'];

  /* 轻量预处理：补全常见隐式乘号，避免用户漏写 * */
  function preprocess(raw) {
    var s = String(raw).trim();
    // 去掉开头的 y = / Y =
    s = s.replace(/^[yY]\s*=\s*/, '');
    // 保护 log10 函数名，避免被「数字后加乘号」规则误伤
    s = s.replace(/log10/g, '__LOG10__');
    // 数字 紧接 字母或 (  -> 数字 * 字母
    s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
    // 变量紧接 ( 且前面不是函数名 -> 补 *
    s = s.replace(/([a-zA-Z]+)\(/g, function (m, w) {
      return FUNCS[w] ? m : w + '*(';
    });
    // ) 紧接 (  -> ) * (
    s = s.replace(/\)\s*\(/g, ')*(');
    s = s.replace(/__LOG10__/g, 'log10');
    return s;
  }

  function compile(expr) {
    var pre = preprocess(expr);
    if (!pre) return { error: '方程不能为空' };
    try {
      var node = math.compile(pre);
      // 用 x=1 试算一次，提前暴露语法错误
      var t = node.evaluate({ x: 1 });
      if (typeof t !== 'number' && !(t && t.isComplex)) {
        return { error: '表达式无法求值为数值' };
      }
      return { node: node, pre: pre };
    } catch (e) {
      return { error: (e && e.message) ? e.message : '表达式解析失败' };
    }
  }

  function evalY(node, x) {
    try {
      var v = node.evaluate({ x: x });
      if (typeof v === 'number') return isFinite(v) ? v : null;
      if (v && v.isComplex) return null; // 复数（如 sqrt 负数）不绘制
      return null;
    } catch (e) {
      return null;
    }
  }

  /* 取「漂亮」的刻度步长 */
  function niceStep(range, target) {
    var raw = range / target;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var step;
    if (norm < 1.5) step = 1;
    else if (norm < 3) step = 2;
    else if (norm < 7) step = 5;
    else step = 10;
    return step * mag;
  }

  function autoRange(compiled, xmin, xmax) {
    var n = 600;
    var lo = Infinity, hi = -Infinity, any = false;
    for (var i = 0; i <= n; i++) {
      var x = xmin + (xmax - xmin) * i / n;
      for (var k = 0; k < compiled.length; k++) {
        var y = evalY(compiled[k].node, x);
        if (y === null) continue;
        if (Math.abs(y) > 1e4) continue; // 跳过渐近线极值
        if (y < lo) lo = y;
        if (y > hi) hi = y;
        any = true;
      }
    }
    if (!any) return { ymin: -10, ymax: 10 };
    if (lo === hi) { lo -= 1; hi += 1; }
    var m = (hi - lo) * 0.12;
    return { ymin: lo - m, ymax: hi + m };
  }

  /* 主绘制 */
  function draw(canvas, opts) {
    var statusEl = opts.statusEl;
    var dpr = Math.max(1, global.devicePixelRatio || 1);
    var cssW = canvas.clientWidth || canvas.parentElement.clientWidth || 340;
    var cssH = Math.min(Math.max(cssW * 0.78, 300), 460);

    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var xmin = opts.xmin, xmax = opts.xmax;
    if (!(xmax > xmin)) {
      if (statusEl) statusEl.textContent = 'X 最大值必须大于最小值';
      return false;
    }

    // 编译方程
    var ok = [];
    var errCount = 0;
    for (var i = 0; i < opts.equations.length; i++) {
      var eq = opts.equations[i];
      var c = compile(eq.expr);
      if (c.error) { errCount++; if (statusEl) statusEl.textContent = '方程「' + eq.expr + '」错误：' + c.error; continue; }
      ok.push({ node: c.node, pre: c.pre, color: eq.color || COLORS[i % COLORS.length] });
    }
    if (ok.length === 0) {
      if (!statusEl) {} else if (errCount) statusEl.textContent = '没有可绘制的有效方程';
      return false;
    }

    var ymin, ymax;
    if (opts.yAuto) {
      var r = autoRange(ok, xmin, xmax);
      ymin = r.ymin; ymax = r.ymax;
    } else {
      ymin = opts.ymin; ymax = opts.ymax;
      if (!(ymax > ymin)) ymax = ymin + 1;
    }

    var W = cssW, H = cssH;
    function SX(x) { return (x - xmin) / (xmax - xmin) * W; }
    function SY(y) { return H - (y - ymin) / (ymax - ymin) * H; }

    // 网格
    var stepX = niceStep(xmax - xmin, 10);
    var stepY = niceStep(ymax - ymin, 8);
    ctx.lineWidth = 1;
    ctx.font = '11px -apple-system,sans-serif';
    ctx.textBaseline = 'middle';

    // 纵向网格
    var startX = Math.ceil(xmin / stepX) * stepX;
    for (var gx = startX; gx <= xmax + 1e-9; gx += stepX) {
      var px = SX(gx);
      ctx.strokeStyle = '#eef2f7';
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    // 横向网格
    var startY = Math.ceil(ymin / stepY) * stepY;
    for (var gy = startY; gy <= ymax + 1e-9; gy += stepY) {
      var py = SY(gy);
      ctx.strokeStyle = '#eef2f7';
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // 坐标轴
    var zeroY = SY(0), zeroX = SX(0);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
    // x 轴
    if (zeroY >= 0 && zeroY <= H) {
      ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(W, zeroY); ctx.stroke();
    }
    // y 轴
    if (zeroX >= 0 && zeroX <= W) {
      ctx.beginPath(); ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, H); ctx.stroke();
    }

    // 刻度标签
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    for (var lx = startX; lx <= xmax + 1e-9; lx += stepX) {
      if (Math.abs(lx) < stepX / 2) continue;
      var lpx = SX(lx);
      var ly = (zeroY >= 0 && zeroY <= H) ? zeroY + 14 : H - 10;
      ctx.fillText(fmt(lx), lpx, ly);
    }
    ctx.textAlign = 'right';
    for (var ly2 = startY; ly2 <= ymax + 1e-9; ly2 += stepY) {
      if (Math.abs(ly2) < stepY / 2) continue;
      var lpy = SY(ly2);
      var lx2 = (zeroX >= 0 && zeroX <= W) ? zeroX - 6 : 6;
      ctx.fillText(fmt(ly2), lx2, lpy);
    }

    // 象限标注
    ctx.fillStyle = '#cbd5e1'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('Ⅰ', W - 16, 6);
    ctx.fillText('Ⅱ', 6, 6);
    ctx.fillText('Ⅲ', 6, H - 18);
    ctx.fillText('Ⅳ', W - 16, H - 18);

    // 原点
    if (zeroX >= 0 && zeroX <= W && zeroY >= 0 && zeroY <= H) {
      ctx.fillStyle = '#475569'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('O', zeroX - 4, zeroY + 4);
    }

    // 绘制曲线
    var n = Math.max(300, Math.round(W * 2));
    for (var e = 0; e < ok.length; e++) {
      var node = ok[e].node, color = ok[e].color;
      ctx.strokeStyle = color; ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      var started = false, prevY = null;
      for (var p = 0; p <= n; p++) {
        var x = xmin + (xmax - xmin) * p / n;
        var y = evalY(node, x);
        if (y === null) { started = false; prevY = null; continue; }
        var sx = SX(x), sy = SY(y);
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else {
          // 断点（渐近线）：突变过大则抬笔
          if (prevY !== null && Math.abs(y - prevY) > (ymax - ymin) * 0.6) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        prevY = y;
      }
      ctx.stroke();
    }

    if (statusEl) {
      statusEl.textContent = '已绘制 ' + ok.length + ' 条曲线 · 点击「适配视图」可自动缩放' +
        (errCount ? '（' + errCount + ' 条表达式有误）' : '');
    }
    return true;
  }

  function fmt(v) {
    var r = Math.round(v * 1000) / 1000;
    if (Math.abs(r) < 1e-9) r = 0;
    return String(r);
  }

  global.Grapher = {
    COLORS: COLORS,
    preprocess: preprocess,
    compile: compile,
    autoRange: autoRange,
    draw: draw
  };
})(window);
