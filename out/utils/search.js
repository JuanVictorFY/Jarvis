"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuzzyMatch = fuzzyMatch;
exports.fuzzyScore = fuzzyScore;
exports.searchItems = searchItems;
function fuzzyMatch(query, target) {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) {
            qi++;
        }
    }
    return qi === q.length;
}
function fuzzyScore(query, target) {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    if (t.includes(q)) {
        return 1.0 - q.length / t.length;
    }
    if (!fuzzyMatch(q, t)) {
        return -1;
    }
    let score = 0;
    let qi = 0;
    let lastMatch = -1;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) {
            const gap = ti - lastMatch - 1;
            score += 1 / (gap + 1);
            lastMatch = ti;
            qi++;
        }
    }
    return score / q.length;
}
function searchItems(query, items, getText, threshold = 0) {
    if (!query.trim()) {
        return items;
    }
    return items
        .map((item) => ({ item, score: fuzzyScore(query, getText(item)) }))
        .filter(({ score }) => score > threshold)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
}
//# sourceMappingURL=search.js.map