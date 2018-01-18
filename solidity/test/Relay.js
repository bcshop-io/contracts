//usage of smart token relay

var BancorConverter = artifacts.require('BancorConverter.sol');
var SmartToken = artifacts.require('SmartToken.sol');
var BancorFormula = artifacts.require('BancorFormula.sol');
var BancorGasPriceLimit = artifacts.require('BancorGasPriceLimit.sol');
var BancorQuickConverter = artifacts.require('BancorQuickConverter.sol');
var BancorConverterExtensions = artifacts.require('BancorConverterExtensions.sol');
var SmartToken = artifacts.require("SmartToken");
var TestToken = artifacts.require("TestERC20DecimalsToken");
var EtherToken = artifacts.require("EtherToken");

const E18 = 1000000000000000000;
function _E18(value) {return value * E18;}
function _R18(value) {return value / E18;}

const weight10Percent = 100000;
const gasPrice = 22000000000;
const gasPriceBad = 22000000001;
const TotalSupply = _E18(500);

//returns specifeid token's real balance
async function _TB(_token, _holder) {
    return new Promise(async (resolve, reject) =>{
        return resolve((await _token.balanceOf.call(_holder)).toNumber());
    })
}

// contract("SmartToken Relay: TOKEN+ETH", function(accounts) {
//     var smartToken;
//     var token, ether;
//     var converter;
//     var formula;
//     var quickConverter;
//     var owner = accounts[0];

//     var initialTokens = 1000000;
//     var initialEther =  100000;
//     var initialSmarts = 1000000;
    
//     it("create relay, tokens and converter (50% - token, 50% eth)", async function() {
//         token = await TestToken.new("BCSToken", "BCS", TotalSupply, 18);
//         ether = await EtherToken.new();        
//         smartToken = await SmartToken.new("BCS Relay", "BCR", 18);                
//         formula = await BancorFormula.new();
//         gasPriceLimit = await BancorGasPriceLimit.new(gasPrice);
//         quickConverter = await BancorQuickConverter.new();
//         converterExtensions = await BancorConverterExtensions.new(formula.address, gasPriceLimit.address, quickConverter.address);
        
//         converter = await BancorConverter.new(smartToken.address, converterExtensions.address, 0, token.address, weight10Percent*5);
//         await converter.addConnector(ether.address, weight10Percent*5, false);

//         await smartToken.issue(converter.address, initialSmarts);
//         await smartToken.transferOwnership(converter.address);
//         await converter.acceptTokenOwnership();
//     })

//     it("transfer connectors to converter", async function() {
//         await ether.deposit({value: initialEther});
//         await ether.transfer(converter.address, initialEther);        
//         await token.transfer(converter.address, initialTokens);        

//         assert.equal(await smartToken.totalSupply.call(), initialSmarts, "Total supply of Smart token should be 100");
//         assert.equal(await _TB(token, converter.address), initialTokens, "Converter's balance of token should be 100");
//         assert.equal(await _TB(ether, converter.address), initialEther, "Converter's balance of ether-token should be 2");
//     })

//     it("sell tokens for relay tokens", async function() {
//         var amountToChange = 100000;//_E18(1);
        
//         var return1 = await converter.getPurchaseReturn.call(token.address, amountToChange);
//         console.log("Buy for " + amountToChange + " BCS, BCR: " + return1);        
        
//         await token.approve(converter.address, amountToChange);
//         await converter.buy(token.address, amountToChange, 1);
//         assert.equal(await _TB(smartToken, owner), return1, "Buy smart token return should match the calculated by formula");        
//         assert.equal(await _TB(token, converter.address), amountToChange + initialTokens, "Converter's balance of token should be initial + change");

//         console.log("Total supply of relay tokens now: " + await smartToken.totalSupply.call());
//     })

//     it("now sell all relay tokens for ether", async function() {
//         var amountToChange = await _TB(smartToken, owner);
//         //await ether.deposit(amountToChange);
//         //await smartToken.approve(converter.address, amountToChange);
//         var sellResultBCS = await converter.getSaleReturn.call(token.address, amountToChange);
//         var sellResultETH = await converter.getSaleReturn.call(ether.address, amountToChange);
//         //console.log("Sell for BCS: " + sellResultBCS);
//         console.log("Sell for ETH: " + sellResultETH);
//         var balance1 = await _TB(ether, owner);
//         var txr = await converter.sell(ether.address, amountToChange, 1);
//         var balance2 = await _TB(ether, owner);
//         assert.equal(balance2 - balance1, sellResultETH, "Should receive amount equal to formula calculated");
//         //console.log(balance2 - balance1);
//         // console.log(txr.logs[0].args);
//         // console.log(balance2);
//     })

//     it("check current exchange rate", async function() {
//         var amountToChange = 100000;//_E18(1);        
//         var return1 = await converter.getPurchaseReturn.call(token.address, amountToChange);
//         console.log("Buy for " + amountToChange + " BCS, BCR: " + return1);
//     })

//     it("exchange bcs for eth", async function() {
//         var amountToChange = 100000;
//         await token.approve(converter.address, amountToChange);
//         var balance1 = await _TB(ether, owner);
//         await converter.convert(token.address, ether.address, amountToChange, 1);
//         var balance2 = await _TB(ether, owner);
//         var gained = balance2 - balance1;
//         console.log("Changed " + amountToChange + " BCS for ETH: " + gained);
//     })

//     it("exchange eth for bcs back", async function() {
//         var amountToChange = 7575;
//         await ether.approve(converter.address, amountToChange);
//         var balance1 = await _TB(token, owner);
//         await converter.convert(ether.address, token.address, amountToChange, 1);
//         var balance2 = await _TB(token, owner);
//         var gained = balance2 - balance1;
//         console.log("Changed " + amountToChange + " ETH for BCS: " + gained);
//     })

//     it("exchange bcs for eth again", async function() {
//         var amountToChange = 100000;
//         await token.approve(converter.address, amountToChange);
//         var balance1 = await _TB(ether, owner);
//         await converter.convert(token.address, ether.address, amountToChange, 1);
//         var balance2 = await _TB(ether, owner);
//         var gained = balance2 - balance1;
//         console.log("Changed " + amountToChange + " BCS for ETH: " + gained);
//     })
// })



contract("Token relay BCS+BNT, Smart Token BNT+ETH", function(accounts) {
    let BNTETH = 200;
    let BCSETH = 100;

    var bcsforOneEther = _E18(BCSETH);
    var bntforOneEther = _E18(BNTETH);
    var relayToken;
    var bcsToken;
    var ethToken;
    var bntToken;
    var bcsConverter, bntConverter;
    var formula;
    var quickConverter;

    var bcsOwner = accounts[0];
    var bntOwner = accounts[1];
    var user = accounts[3];
    
    var initialBcs = TotalSupply * 20 / 1000; //2% of total tokens
    var initialBnt1 = _E18(1000);
    var initialBnt2 = initialBcs * BNTETH / BCSETH;
    var initialEth =  initialBnt1 / BNTETH / 10; //corresponds to 10% connector weight
    var initialBcr = _E18(100);
    var userBcsBalance;
    
    it("create BNT, with ETH 10% weight as connector", async function() {
        ethToken = await EtherToken.new({from:bntOwner});
        bntToken = await SmartToken.new("BNT Token", "BNT", 18, {from:bntOwner});
        formula = await BancorFormula.new({from:bntOwner});
        gasPriceLimit = await BancorGasPriceLimit.new(gasPrice, {from:bntOwner});
        quickConverter = await BancorQuickConverter.new({from:bntOwner});
        converterExtensions = await BancorConverterExtensions.new(formula.address, gasPriceLimit.address, quickConverter.address, {from:bntOwner});
        
        bntConverter = await BancorConverter.new(bntToken.address, converterExtensions.address,
                     0, ethToken.address, weight10Percent*1, {from:bntOwner});

        await bntToken.issue(bntConverter.address, initialBnt1, {from:bntOwner});
        await bntToken.issue(bcsOwner, initialBnt2, {from:bntOwner});

        await bntToken.transferOwnership(bntConverter.address, {from:bntOwner});
        await bntConverter.acceptTokenOwnership({from:bntOwner});
        
        await ethToken.deposit({from: bntOwner, value: initialEth});
        await ethToken.transfer(bntConverter.address, initialEth, {from:bntOwner});

        //assert.equal(await bntToken.totalSupply.call(), initialBnt1 , "Invalid total supply of BNT");
        assert.equal(await _TB(bntToken, bntConverter.address), initialBnt1, "Invalid BntConverter's balance of BNT");
        assert.equal(await _TB(ethToken, bntConverter.address), initialEth, "Invalid BntConverter's balance of ETH");
    });

    // it("bcs owner buys bnt on relay", async function() {
    //     let oldBntBalance = await bntToken.balanceOf.call(bcsOwner);
    //     let etherAmount = initialBcs / BCSETH;
    //     var expectedBntAmount = (await bntConverter.getPurchaseReturn(ethToken.address, etherAmount)).toNumber();
    //     // console.log(etherAmount);
    //     console.log(expectedBntAmount);
    //     await ethToken.deposit({from:bcsOwner, value:etherAmount});
    //     await ethToken.approve(bntConverter.address, _E18(10), {from:bcsOwner});
    //     await bntConverter.convert(ethToken.address, bntToken.address, etherAmount, 1, {from:bcsOwner});

    //     assert.equal(await _TB(bntToken, bcsOwner), expectedBntAmount, "!!");
    // });
    
    it("create BCSBNT relay (50% BCS, 50% BNT)", async function() {
        initialBnt2 = await bntToken.balanceOf.call(bcsOwner);//await _TB(bntToken, bcsOwner);
        console.log(initialBnt2);
        userBcsBalance = _E18(8);
        bcsToken = await TestToken.new("BCS Token", "BCS", TotalSupply, 18);        
        await bcsToken.transfer(user, userBcsBalance);

        relayToken = await SmartToken.new("BCS Relay", "BCSBNT", 18);
        formula = await BancorFormula.new();
        gasPriceLimit = await BancorGasPriceLimit.new(gasPrice);
        quickConverter = await BancorQuickConverter.new();
        converterExtensions = await BancorConverterExtensions.new(formula.address, gasPriceLimit.address, quickConverter.address);
        
        bcsConverter = await BancorConverter.new(relayToken.address, converterExtensions.address, 20000, bcsToken.address, weight10Percent*5);        
        await bcsConverter.addConnector(bntToken.address, weight10Percent*5, false);
        //await bcsConverter.setConversionFee(10000);

        await relayToken.issue(bcsConverter.address, initialBcr);
        await relayToken.transferOwnership(bcsConverter.address);
        await bcsConverter.acceptTokenOwnership();

        //if set to true, quick change to ether results in direct ether send; otherwise, manually withdraw from ethToken
        //await quickConverter.registerEtherToken(ethToken.address, true);

        await bcsToken.transfer(bcsConverter.address, initialBcs);
        await bntToken.transfer(bcsConverter.address, initialBnt2);

        // assert.equal(await relayToken.totalSupply.call(), initialBcr, "Invalid total supply of BCR");
        // assert.equal(await _TB(bcsToken, bcsConverter.address), initialBcs, "Invalid BcsConverter's balance of BCS");
        // assert.equal(await _TB(bntToken, bcsConverter.address), initialBnt2, "Invalid BcsConverter's balance of BNT");
    })
    
    it("change bcs to bnt", async function() {        
        var amountToChange = _E18(0.1);

        await bcsToken.approve(bcsConverter.address, TotalSupply, {from:user});
        var balance1 = await _TB(bntToken, user);
        await bcsConverter.convert(bcsToken.address, bntToken.address, amountToChange, 1, {from:user});
        var balance2 = await _TB(bntToken, user);
        var gained = balance2 - balance1;
        var gainedEth = gained / bntforOneEther;
        console.log("Changed " + _R18(amountToChange) + " BCS for " + _R18(gained) + " BNT (" + gainedEth + " ETH)");
    });

    it("change bcs to bnt again", async function() {        
        var amountToChange = _E18(0.1);
        
        var balance1 = await _TB(bntToken, user);
        await bcsConverter.convert(bcsToken.address, bntToken.address, amountToChange, 1, {from:user});
        var balance2 = await _TB(bntToken, user);
        var gained = balance2 - balance1;
        var gainedEth = gained / bntforOneEther;
        console.log("Changed " + _R18(amountToChange) + " BCS for " + _R18(gained) + " BNT (" + gainedEth + " ETH)");
    });

    
    it("change bnt to bcs back", async function() {
        var amountToApprove = await _TB(bntToken, user);
        await bntToken.approve(bcsConverter.address, amountToApprove, {from:user});
      //  console.log(_R18(amountToApprove));
        var amountToChange = _E18(0.2);
        var balance1 = await _TB(bcsToken, user);
        await bcsConverter.convert(bntToken.address, bcsToken.address, amountToChange, 1, {from:user});
        var balance2 = await _TB(bcsToken, user);
        var gained = balance2 - balance1;        
        console.log("Changed " + _R18(amountToChange) + " BNT for " + _R18(gained) + " BCS");
    });

    it("change bcs to bnt again", async function() {        
        var amountToChange = _E18(0.1);
        
        var balance1 = await _TB(bntToken, user);
        await bcsConverter.convert(bcsToken.address, bntToken.address, amountToChange, 1, {from:user});
        var balance2 = await _TB(bntToken, user);
        var gained = balance2 - balance1;
        var gainedEth = gained / bntforOneEther;
        console.log("Changed " + _R18(amountToChange) + " BCS for " + _R18(gained) + " BNT (" + gainedEth + " ETH)");
    });    

    it("quick change BCS to ETH as user", async function() {
        var amount = _E18(0.1);
        var quickBuyPath = [
            bcsToken.address, 
            relayToken.address, 
            bntToken.address, 
            bntToken.address, 
            ethToken.address];
        
        //console.log(await bcsToken.allowance(user, bcsConverter.address));
        //console.log(await bntToken.allowance(user, bcsConverter.address));
        
        var txr = await bcsConverter.quickConvert(quickBuyPath, amount, 1, {from:user});
       // console.log(txr.logs);
        var result = await _TB(ethToken, user);
        console.log("Changed " + _R18(amount) + " BCS for " + _R18(result) + " ETH");
        await ethToken.withdraw(result, {from:user});

        var txr = await bcsConverter.quickConvert(quickBuyPath, amount, 1, {from:user});
        //console.log(txr.logs);
        var result = await _TB(ethToken, user);
        console.log("Changed " + _R18(amount) + " BCS for " + _R18(result) + " ETH");
    })

    it("withdraw tokens from the relay", async function() {
        let bcsOnConverter = await bcsToken.balanceOf.call(bcsConverter.address); //await _TB(bcsToken, bcsConverter.address);
        // console.log("BCS left in converter: ");
        // console.log(bcsOnConverter.toString());

        let bntOnConverter = await bntToken.balanceOf.call(bcsConverter.address);
        // console.log("BNT left in converter: ");
        // console.log(bntOnConverter.toString());

        await bcsConverter.withdrawTokens(bcsToken.address, accounts[9], bcsOnConverter);
        await bcsConverter.withdrawTokens(bntToken.address, accounts[9], bntOnConverter);

        assert.equal(await _TB(bcsToken, bcsConverter.address), 0, "There should be 0 BCS in converter");
        assert.equal(await _TB(bntToken, bcsConverter.address), 0, "There should be 0 BNT in converter");

        assert.equal(await _TB(bcsToken, accounts[9]), bcsOnConverter, "There should be ALL BCS transfered to accounts[9]");
        assert.equal(await _TB(bntToken, accounts[9]), bntOnConverter, "There should be ALL BNT transfered to accounts[9]");
    });
})

