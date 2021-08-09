"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var chai_1 = require("chai");
var DrawCalculator_1 = require("../src/DrawCalculator");
describe('DrawCalculator', function () {
    it('Single DrawCalculator run', function () { return __awaiter(void 0, void 0, void 0, function () {
        var exampleDrawSettings, exampleDraw, exampleUser, prize;
        return __generator(this, function (_a) {
            exampleDrawSettings = {
                distributions: [ethers_1.ethers.utils.parseEther("0.3"),
                    ethers_1.ethers.utils.parseEther("0.2"),
                    ethers_1.ethers.utils.parseEther("0.1")],
                pickCost: ethers_1.BigNumber.from(ethers_1.ethers.utils.parseEther("1")),
                matchCardinality: ethers_1.BigNumber.from(3),
                bitRangeValue: ethers_1.BigNumber.from(15),
                bitRangeSize: ethers_1.BigNumber.from(4)
            };
            exampleDraw = {
                timestamp: 10000,
                prize: ethers_1.BigNumber.from(100),
                winningRandomNumber: ethers_1.BigNumber.from(61676)
            };
            exampleUser = {
                address: "0x568Ea56Dd5d8044269b1482D3ad4120a7aB0933A",
                balance: ethers_1.ethers.utils.parseEther("10"),
                pickIndices: [ethers_1.BigNumber.from(1)]
            };
            prize = DrawCalculator_1.runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser);
            chai_1.expect(prize.toString()).to.equal("500");
            return [2 /*return*/];
        });
    }); });
    it('Can findBitMatchesAtIndex', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            result = DrawCalculator_1.findBitMatchesAtIndex(ethers_1.BigNumber.from(61676), ethers_1.BigNumber.from(61612), ethers_1.BigNumber.from(8), ethers_1.BigNumber.from(255));
            chai_1.expect(result).to.be.true;
            return [2 /*return*/];
        });
    }); });
});
