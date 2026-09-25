/* RoomSplit engine - fair rent division for unequal rooms. Pure math, no DOM. */
(function (root) {
  'use strict';

  const DEFAULT_WEIGHTS = { bath: 0.15, balcony: 0.10, light: 0.08, quiet: 0.07 };

  function num(v, name) {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (typeof n !== 'number' || !isFinite(n) || isNaN(n)) throw new Error(name + ' must be a number');
    return n;
  }

  function round2(x) { return Math.round(x * 100) / 100; }

  function split(opts) {
    if (!opts || typeof opts !== 'object') throw new Error('options required');
    const totalRent = num(opts.totalRent, 'totalRent');
    if (totalRent <= 0 || totalRent > 1000000) throw new Error('totalRent must be in (0, 1000000]');
    if (!Array.isArray(opts.rooms)) throw new Error('rooms must be an array');
    if (opts.rooms.length < 1 || opts.rooms.length > 8) throw new Error('rooms must have 1 to 8 entries');

    const w = Object.assign({}, DEFAULT_WEIGHTS, opts.weights || {});
    for (const k of Object.keys(DEFAULT_WEIGHTS)) {
      const v = num(w[k], 'weight ' + k);
      if (v < 0 || v > 1) throw new Error('weight ' + k + ' must be in [0, 1]');
      w[k] = v;
    }

    const rooms = opts.rooms.map(function (r, i) {
      if (!r || typeof r !== 'object') throw new Error('room ' + (i + 1) + ' invalid');
      const sqm = num(r.sqm, 'room ' + (i + 1) + ' sqm');
      if (sqm <= 0 || sqm > 200) throw new Error('room ' + (i + 1) + ' sqm must be in (0, 200]');
      let bonus = 0;
      const feats = [];
      for (const k of Object.keys(DEFAULT_WEIGHTS)) {
        if (r[k]) { bonus += w[k]; feats.push(k); }
      }
      const points = sqm * (1 + bonus);
      return { name: (r.name && String(r.name).trim()) || ('Room ' + (i + 1)), sqm: sqm, features: feats, bonusPct: bonus * 100, points: points };
    });

    const totalPoints = rooms.reduce(function (s, r) { return s + r.points; }, 0);
    const even = totalRent / rooms.length;

    // exact-currency rounding with drift correction on the largest room
    let assigned = rooms.map(function (r) {
      const exact = totalRent * r.points / totalPoints;
      return { r: r, exact: exact, rent: Math.round(exact) };
    });
    let drift = Math.round(totalRent) - assigned.reduce(function (s, a) { return s + a.rent; }, 0);
    if (drift !== 0) {
      let biggest = assigned[0];
      for (const a of assigned) if (a.exact > biggest.exact) biggest = a;
      biggest.rent += drift;
    }

    const outRooms = assigned.map(function (a) {
      return {
        name: a.r.name, sqm: a.r.sqm, features: a.r.features, bonusPct: round2(a.r.bonusPct),
        points: round2(a.r.points), sharePct: round2(a.r.points / totalPoints * 100),
        rent: a.rent, deltaVsEven: a.rent - round2(even)
      };
    });

    return {
      totalRent: totalRent,
      evenSplit: round2(even),
      rooms: outRooms,
      sumCheck: outRooms.reduce(function (s, r) { return s + r.rent; }, 0),
      spread: Math.max.apply(null, outRooms.map(function (r) { return r.rent; })) - Math.min.apply(null, outRooms.map(function (r) { return r.rent; }))
    };
  }

  const api = { DEFAULT_WEIGHTS: DEFAULT_WEIGHTS, split: split };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RoomSplitEngine = api;
})(typeof self !== 'undefined' ? self : this);
