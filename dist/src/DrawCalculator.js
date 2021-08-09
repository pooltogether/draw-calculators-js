"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanityCheckDrawSettings = exports.calculatePrizeAmount = exports.findBitMatchesAtIndex = exports.calculatePickFraction = exports.runDrawCalculatorForSingleDraw = void 0;
var ethers_1 = require("ethers");
var printUtils = require("./helpers/printUtils");
var dim = printUtils.dim;
function runDrawCalculatorForSingleDraw(drawSettings, draw, user) {
    var sanityCheckDrawSettingsResult = sanityCheckDrawSettings(drawSettings);
    if (sanityCheckDrawSettingsResult != "") {
        throw new Error("DrawSettings invalid: " + sanityCheckDrawSettingsResult);
    }
    /* CALCULATE() */
    //  bytes32 userRandomNumber = keccak256(abi.encodePacked(user)); // hash the users address
    var userRandomNumber = ethers_1.ethers.utils.solidityKeccak256(["address"], [user.address]);
    // for (uint256 index = 0; index < winningRandomNumbers.length; index++) {
    //single winning number -> no loop required
    /* _CALCULATE()*/
    // uint256 totalUserPicks = balance / _drawSettings.pickCost;
    var totalUserPicks = user.balance.div(drawSettings.pickCost);
    dim("totalUserPicks " + totalUserPicks);
    var pickPayoutFraction = ethers_1.BigNumber.from(0);
    var defaultAbiCoder = ethers_1.ethers.utils.defaultAbiCoder;
    var picksLength = user.pickIndices.length;
    //for(uint256 index  = 0; index < picks.length; index++){
    for (var i = 0; i < picksLength; i++) {
        if (user.pickIndices[i] > totalUserPicks) {
            throw new Error("User does not have this many picks!");
        }
        // uint256 randomNumberThisPick = uint256(keccak256(abi.encode(userRandomNumber, picks[index])));       
        var abiEncodedRandomNumberPlusPickIndice = defaultAbiCoder.encode(["bytes32", "uint256"], [userRandomNumber, user.pickIndices[i]]);
        console.log(abiEncodedRandomNumberPlusPickIndice);
        // does the below line type need to be bytes32?
        var randomNumberThisPick = ethers_1.ethers.utils.solidityKeccak256(["string"], [abiEncodedRandomNumberPlusPickIndice]);
        // pickPayoutFraction += calculatePickFraction(randomNumberThisPick, winningRandomNumber, _drawSettings);
        pickPayoutFraction = pickPayoutFraction.add(calculatePickFraction(randomNumberThisPick, draw.winningRandomNumber, drawSettings, draw));
    }
    return pickPayoutFraction.mul(draw.prize);
}
exports.runDrawCalculatorForSingleDraw = runDrawCalculatorForSingleDraw;
//function calculatePickFraction(uint256 randomNumberThisPick, uint256 winningRandomNumber, DrawSettings memory _drawSettings)
function calculatePickFraction(randomNumberThisPick, winningRandomNumber, _drawSettings, draw) {
    var prizeFraction = ethers_1.BigNumber.from(0);
    var numberOfMatches = 0;
    // for(uint256 matchIndex = 0; matchIndex < _matchCardinality; matchIndex++){
    for (var matchIndex = 0; matchIndex < _drawSettings.matchCardinality.toNumber(); matchIndex++) {
        var _matchIndexOffset = matchIndex - _drawSettings.bitRangeSize.toNumber();
        if (findBitMatchesAtIndex(ethers_1.BigNumber.from(randomNumberThisPick), winningRandomNumber, ethers_1.BigNumber.from(_matchIndexOffset), _drawSettings.bitRangeValue)) {
            numberOfMatches++;
        }
    }
    dim("found " + numberOfMatches + " matches..");
    return calculatePrizeAmount(_drawSettings, draw, numberOfMatches);
}
exports.calculatePickFraction = calculatePickFraction;
//function _findBitMatchesAtIndex(uint256 word1, uint256 word2, uint256 indexOffset, uint8 _bitRangeMaskValue) 
function findBitMatchesAtIndex(word1, word2, indexOffset, bitRangeValue) {
    var word1DataHexString = word1.toHexString();
    var word2DataHexString = word2.toHexString();
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#operators
    var mask = BigInt(bitRangeValue.toString()) << BigInt(indexOffset.toString());
    var bits1 = BigInt(word1DataHexString) & BigInt(mask);
    var bits2 = BigInt(word2DataHexString) & BigInt(mask);
    return bits1 == bits2;
}
exports.findBitMatchesAtIndex = findBitMatchesAtIndex;
// calculates the absolute amount of Prize in Wei for the Draw and DrawSettings
function calculatePrizeAmount(drawSettings, draw, matches) {
    var distributionIndex = drawSettings.matchCardinality.toNumber() - matches;
    console.log("distributionIndex ", distributionIndex);
    if (distributionIndex > drawSettings.distributions.length) {
        throw new Error("There are only " + drawSettings.distributions.length + " tiers of prizes"); // there is no "winning number" in this case
    }
    // now calculate the expected prize amount for these settings
    // totalPrize *  (distributions[index]/(range ^ index)) where index = matchCardinality - numberOfMatches
    var numberOfPrizes = Math.pow(drawSettings.bitRangeSize.toNumber(), distributionIndex);
    console.log("numberOfPrizes ", numberOfPrizes);
    var valueAtDistributionIndex = drawSettings.distributions[distributionIndex];
    console.log("valueAtDistributionIndex ", valueAtDistributionIndex);
    var percentageOfPrize = valueAtDistributionIndex.div(numberOfPrizes);
    var expectedPrizeAmount = (draw.prize).mul(percentageOfPrize).div(ethers_1.ethers.constants.WeiPerEther);
    console.log("expectedPrizeAmount ", expectedPrizeAmount.toString());
    return expectedPrizeAmount;
}
exports.calculatePrizeAmount = calculatePrizeAmount;
function sanityCheckDrawSettings(drawSettings) {
    if (drawSettings.matchCardinality.gt(drawSettings.distributions.length)) {
        console.log("DrawCalc/matchCardinality-gt-distributions");
        return "DrawCalc/matchCardinality-gt-distributions";
    }
    else if (!(drawSettings.bitRangeValue.toNumber() == (Math.pow(2, drawSettings.bitRangeSize.toNumber()) - 1))) {
        return "DrawCalc/bitRangeValue-incorrect";
    }
    else if (drawSettings.bitRangeSize.gte(Math.floor((256 / drawSettings.matchCardinality.toNumber())))) {
        return "DrawCalc/bitRangeSize-too-large";
    }
    else if (drawSettings.pickCost.lte(0)) {
        return "DrawCalc/pick-gt-0";
    }
    else {
        var sum = ethers_1.BigNumber.from(0);
        for (var i = 0; i < drawSettings.distributions.length; i++) {
            sum = sum.add(drawSettings.distributions[i]);
        }
        if (sum.gte(ethers_1.ethers.utils.parseEther("1"))) {
            return "DrawCalc/distributions-gt-100%";
        }
    }
    return "";
}
exports.sanityCheckDrawSettings = sanityCheckDrawSettings;
