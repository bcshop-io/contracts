//usage of smart token relay

var BancorConverter = artifacts.require('BancorConverter.sol');
var SmartToken = artifacts.require('SmartToken.sol');
var BancorFormula = artifacts.require('BancorFormula.sol');
var BancorGasPriceLimit = artifacts.require('BancorGasPriceLimit.sol');
var BancorQuickConverter = artifacts.require('BancorQuickConverter.sol');
var BancorConverterExtensions = artifacts.require('BancorConverterExtensions.sol');
var SmartToken = artifacts.require("SmartToken");
var TestToken = artifacts.require("TestERC20Token");
var EtherToken = artifacts.require("EtherToken");

const weight10Percent = 100000;
const gasPrice = 22000000000;
const gasPriceBad = 22000000001;
const TotalSupply = 10000000;
const E18 = 1000000000000000000;

function _E18(value) {return value * E18;}

function _R18(value) {return value / E18;}

//returns specifeid token's real balance
async function _TB(_token, _holder) {
    return new Promise(async (resolve, reject) =>{
        return resolve((await _token.balanceOf.call(_holder)).toNumber());
    })
}

contract("SmartToken Relay: TOKEN+ETH", function(accounts) {
    var smartToken;
    var token, ether;
    var converter;
    var formula;
    var quickConverter;
    var owner = accounts[0];

    var initialTokens = 1000000;
    var initialEther =  100000;
    var initialSmarts = 1000000;
    
    it("create relay, tokens and converter (50% - token, 50% eth)", async function() {
        token = await TestToken.new("BCSToken", "BCS", TotalSupply, 18);
        ether = await EtherToken.new();        
        smartToken = await SmartToken.new("BCS Relay", "BCR", 18);                
        formula = await BancorFormula.new();
        gasPriceLimit = await BancorGasPriceLimit.new(gasPrice);
        quickConverter = await BancorQuickConverter.new();
        converterExtensions = await BancorConverterExtensions.new(formula.address, gasPriceLimit.address, quickConverter.address);
        
        converter = await BancorConverter.new(smartToken.address, converterExtensions.address, 0, token.address, weight10Percent*5);
        await converter.addConnector(ether.address, weight10Percent*5, false);

        await smartToken.issue(converter.address, initialSmarts);
        await smartToken.transferOwnership(converter.address);
        await converter.acceptTokenOwnership();
    })

    it("transfer connectors to converter", async function() {
        await ether.deposit({value: initialEther});
        await ether.transfer(converter.address, initialEther);        
        await token.transfer(converter.address, initialTokens);        

        assert.equal(await smartToken.totalSupply.call(), initialSmarts, "Total supply of Smart token should be 100");
        assert.equal(await _TB(token, converter.address), initialTokens, "Converter's balance of token should be 100");
        assert.equal(await _TB(ether, converter.address), initialEther, "Converter's balance of ether-token should be 2");
    })

    it("sell tokens for relay tokens", async function() {
        var amountToChange = 100000;//_E18(1);
        
        var return1 = await converter.getPurchaseReturn.call(token.address, amountToChange);
        console.log("Buy for " + amountToChange + " BCS, BCR: " + return1);        
        
        await token.approve(converter.address, amountToChange);
        await converter.buy(token.address, amountToChange, 1);
        assert.equal(await _TB(smartToken, owner), return1, "Buy smart token return should match the calculated by formula");        
        assert.equal(await _TB(token, converter.address), amountToChange + initialTokens, "Converter's balance of token should be initial + change");

        console.log("Total supply of relay tokens now: " + await smartToken.totalSupply.call());
    })

    it("now sell all relay tokens for ether", async function() {
        var amountToChange = await _TB(smartToken, owner);
        //await ether.deposit(amountToChange);
        //await smartToken.approve(converter.address, amountToChange);
        var sellResultBCS = await converter.getSaleReturn.call(token.address, amountToChange);
        var sellResultETH = await converter.getSaleReturn.call(ether.address, amountToChange);
        //console.log("Sell for BCS: " + sellResultBCS);
        console.log("Sell for ETH: " + sellResultETH);
        var balance1 = await _TB(ether, owner);
        var txr = await converter.sell(ether.address, amountToChange, 1);
        var balance2 = await _TB(ether, owner);
        assert.equal(balance2 - balance1, sellResultETH, "Should receive amount equal to formula calculated");
        //console.log(balance2 - balance1);
        // console.log(txr.logs[0].args);
        // console.log(balance2);
    })

    it("check current exchange rate", async function() {
        var amountToChange = 100000;//_E18(1);        
        var return1 = await converter.getPurchaseReturn.call(token.address, amountToChange);
        console.log("Buy for " + amountToChange + " BCS, BCR: " + return1);
    })

    it("exchange bcs for eth", async function() {
        var amountToChange = 100000;
        await token.approve(converter.address, amountToChange);
        var balance1 = await _TB(ether, owner);
        await converter.convert(token.address, ether.address, amountToChange, 1);
        var balance2 = await _TB(ether, owner);
        var gained = balance2 - balance1;
        console.log("Changed " + amountToChange + " BCS for ETH: " + gained);
    })

    it("exchange eth for bcs back", async function() {
        var amountToChange = 7575;
        await ether.approve(converter.address, amountToChange);
        var balance1 = await _TB(token, owner);
        await converter.convert(ether.address, token.address, amountToChange, 1);
        var balance2 = await _TB(token, owner);
        var gained = balance2 - balance1;
        console.log("Changed " + amountToChange + " ETH for BCS: " + gained);
    })

    it("exchange bcs for eth again", async function() {
        var amountToChange = 100000;
        await token.approve(converter.address, amountToChange);
        var balance1 = await _TB(ether, owner);
        await converter.convert(token.address, ether.address, amountToChange, 1);
        var balance2 = await _TB(ether, owner);
        var gained = balance2 - balance1;
        console.log("Changed " + amountToChange + " BCS for ETH: " + gained);
    })
})
