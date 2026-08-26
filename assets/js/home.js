/* 主页导航：本地存储网页入口，支持添加 / 编辑 / 删除，点卡片打开对应页面 */
(function () {
  'use strict';

  var KEY = 'home_nav_v1';

  function $(id) { return document.getElementById(id); }

  function read() {
    try {
      var r = localStorage.getItem(KEY);
      if (!r) return null;
      var a = JSON.parse(r);
      return Array.isArray(a) ? a : null;
    } catch (e) { return null; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  // 首次使用预置方程绘图器
  var entries = read();
  if (!entries) {
    entries = [{ name: '方程绘图器', url: 'grapher.html', icon: '∿' }];
    write(entries);
  }

  var managing = false;
  var editId = null;

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.hidden = true; }, 1600);
  }

  function render() {
    var grid = $('appGrid');
    grid.innerHTML = '';
    grid.classList.toggle('manage', managing);
    if (entries.length === 0) {
      grid.innerHTML = '<div class="empty-tip">还没有网页。点右上角「＋」添加你的第一个网页。</div>';
      return;
    }
    entries.forEach(function (it, i) {
      var card = document.createElement('div');
      card.className = 'app-card';

      var ico = document.createElement('div');
      ico.className = 'app-ico';
      ico.textContent = it.icon || '•';

      var name = document.createElement('div');
      name.className = 'app-name';
      name.textContent = it.name;

      var url = document.createElement('div');
      url.className = 'app-url';
      url.textContent = it.url;

      var del = document.createElement('button');
      del.className = 'app-del';
      del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', function (e) { e.stopPropagation(); removeEntry(i); });

      card.appendChild(ico);
      card.appendChild(name);
      card.appendChild(url);
      card.appendChild(del);

      card.addEventListener('click', function () {
        if (managing) openEdit(i);
        else window.location.href = it.url;
      });
      grid.appendChild(card);
    });
  }

  function openEdit(i) {
    editId = i;
    var it = entries[i];
    $('editTitle').textContent = '编辑网页';
    $('inName').value = it.name || '';
    $('inUrl').value = it.url || '';
    $('inIcon').value = it.icon || '';
    $('editDel').style.display = '';
    $('editMask').hidden = false;
  }
  function openAdd() {
    editId = null;
    $('editTitle').textContent = '添加网页';
    $('inName').value = '';
    $('inUrl').value = '';
    $('inIcon').value = '';
    $('editDel').style.display = 'none';
    $('editMask').hidden = false;
    setTimeout(function () { $('inName').focus(); }, 50);
  }
  function saveEdit() {
    var name = $('inName').value.trim();
    var url = $('inUrl').value.trim();
    if (!name || !url) { toast('请填写名称和地址'); return; }
    var icon = $('inIcon').value.trim();
    if (editId === null) entries.push({ name: name, url: url, icon: icon });
    else entries[editId] = { name: name, url: url, icon: icon };
    write(entries);
    render();
    $('editMask').hidden = true;
    toast(editId === null ? '已添加' : '已保存');
  }
  function removeEntry(i) {
    entries.splice(i, 1);
    write(entries);
    render();
    toast('已删除');
  }
  function delEdit() {
    if (editId === null) return;
    entries.splice(editId, 1);
    write(entries);
    render();
    $('editMask').hidden = true;
    toast('已删除');
  }

  $('addBtn').addEventListener('click', openAdd);
  $('manageBtn').addEventListener('click', function () {
    managing = !managing;
    this.classList.toggle('active', managing);
    this.textContent = managing ? '完成' : '✎';
    render();
  });
  $('editCancel').addEventListener('click', function () { $('editMask').hidden = true; });
  $('editSave').addEventListener('click', saveEdit);
  $('editDel').addEventListener('click', delEdit);
  $('editMask').addEventListener('click', function (e) { if (e.target === this) $('editMask').hidden = true; });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  render();
})();
