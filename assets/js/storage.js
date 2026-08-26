/* 本地数据存储模块：使用 localStorage 持久化用户保存的方程数据 */
(function (global) {
  'use strict';
  var KEY = 'eqgrapher_save_v1';

  function readAll() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn('读取数据失败', e);
      return [];
    }
  }

  function writeAll(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.warn('写入数据失败', e);
      return false;
    }
  }

  function uid() {
    return 'eq_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  var Storage = {
    /* 返回全部保存项（按更新时间倒序） */
    list: function () {
      return readAll().sort(function (a, b) {
        return (b.updated || 0) - (a.updated || 0);
      });
    },
    /* 新增或更新一条数据；item: {id?, name, exprs:[{expr,color}], xmin, xmax, yAuto, ymin, ymax} */
    save: function (item) {
      var list = readAll();
      var now = Date.now();
      if (item.id) {
        var found = false;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === item.id) {
            list[i].name = item.name;
            list[i].exprs = item.exprs;
            list[i].xmin = item.xmin;
            list[i].xmax = item.xmax;
            list[i].yAuto = item.yAuto;
            list[i].ymin = item.ymin;
            list[i].ymax = item.ymax;
            list[i].updated = now;
            found = true;
            break;
          }
        }
        if (!found) {
          list.push({
            id: item.id, name: item.name, exprs: item.exprs,
            xmin: item.xmin, xmax: item.xmax, yAuto: item.yAuto,
            ymin: item.ymin, ymax: item.ymax, created: now, updated: now
          });
        }
        writeAll(list);
        return item.id;
      }
      var id = uid();
      list.push({
        id: id, name: item.name, exprs: item.exprs,
        xmin: item.xmin, xmax: item.xmax, yAuto: item.yAuto,
        ymin: item.ymin, ymax: item.ymax, created: now, updated: now
      });
      writeAll(list);
      return id;
    },
    /* 按 id 获取 */
    get: function (id) {
      var list = readAll();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
      }
      return null;
    },
    /* 删除 */
    remove: function (id) {
      var list = readAll().filter(function (it) { return it.id !== id; });
      return writeAll(list);
    },
    /* 清空 */
    clear: function () { return writeAll([]); }
  };

  global.Storage = Storage;
})(window);
