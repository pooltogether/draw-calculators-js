"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var DrawCalculator_1 = require("./DrawCalculator");
//  runs calculate(), holds everything fixed but changes Draw.winningRandomNumber n times
function runDrawNTimesSingleUser(n, drawSettings, draw, user) {
    console.log("running DrawCalculator simulation " + n + " times..");
    //record starting time
    console.time("runSimulationNTimes");
    // how can we make the following concurrent? child.spawn() for each iteration - is there a better way to do this in modern node js?
    var simResults = [];
    for (var i = 0; i < n; i++) {
        // change random number
        var newWinningRandomNumberAddress = (ethers_1.ethers.Wallet.createRandom()).address;
        // is ethers.Wallet.createRandom() 
        // going to give uniform random seeds over time?
        // there is also a bias option we can use as an input
        var hashOfNewWinningRandonNumber = ethers_1.ethers.utils.solidityKeccak256(["address"], [newWinningRandomNumberAddress]);
        var newWinningRandomNumber = ethers_1.BigNumber.from(hashOfNewWinningRandonNumber);
        var runDraw = __assign(__assign({}, draw), { winningRandomNumber: newWinningRandomNumber });
        var prizeReceived = DrawCalculator_1.runDrawCalculatorForSingleDraw(drawSettings, runDraw, user);
        simResults.push({
            draw: runDraw,
            user: user,
            drawSettings: drawSettings,
            prizeReceived: prizeReceived
        });
    }
    //record finishing time
    console.time("runSimulationNTimes");
    return simResults;
}
//  changes DrawSettings.matchCardinality holds everything else constant 
function runDrawSingleUserChangeMatchCardinality() {
    var RUN_TIME = 100;
    var drawSettings = {
        distributions: [ethers_1.ethers.utils.parseEther("0.3"),
            ethers_1.ethers.utils.parseEther("0.2"),
            ethers_1.ethers.utils.parseEther("0.1")],
        pickCost: ethers_1.BigNumber.from(ethers_1.ethers.utils.parseEther("1")),
        matchCardinality: ethers_1.BigNumber.from(3),
        bitRangeValue: ethers_1.BigNumber.from(15),
        bitRangeSize: ethers_1.BigNumber.from(4)
    };
    var draw = {
        timestamp: 10000,
        prize: ethers_1.BigNumber.from(100),
        winningRandomNumber: ethers_1.BigNumber.from(61676)
    };
    var user = {
        address: "0x568Ea56Dd5d8044269b1482D3ad4120a7aB0933A",
        balance: ethers_1.ethers.utils.parseEther("10"),
        pickIndices: [ethers_1.BigNumber.from(1)]
    };
    var simResults = { results: [] };
    // drawSettings matchCardinality must satisfy sanityCheckDrawSettings
    // matchCardinality is uint16 (65,536) possibilities
    for (var i = 0; i < 65536; i++) {
        var drawSettingsThisRun = __assign(__assign({}, drawSettings), { matchCardinality: ethers_1.BigNumber.from(i) });
        if (DrawCalculator_1.sanityCheckDrawSettings(drawSettingsThisRun) != "") {
            // this settings cannot be set, skipping
            continue;
        }
        simResults.results.push(runDrawNTimesSingleUser(100, drawSettingsThisRun, draw, user));
    }
    // do something with results
}
