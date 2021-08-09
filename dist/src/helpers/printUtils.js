"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var chalk = require("chalk");
function dim() {
    var _a;
    console.log((_a = chalk.dim).call.apply(_a, __spreadArray([chalk], __read(arguments))));
}
function yellow() {
    var _a;
    console.log((_a = chalk.yellow).call.apply(_a, __spreadArray([chalk], __read(arguments))));
}
function green() {
    var _a;
    console.log((_a = chalk.green).call.apply(_a, __spreadArray([chalk], __read(arguments))));
}
module.exports = {
    dim: dim,
    yellow: yellow,
    green: green
};
