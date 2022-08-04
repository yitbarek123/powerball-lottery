App = {

    contracts: {},
    web3Provider: null,             // Web3 provider
    url: 'http://localhost:8545',   // Url for web3
    account: '0x0',                 // current ethereum account
    lottery_address: '0x0',

    init: function() {
        return App.initWeb3();
    },

    /* initialize Web3 */
    initWeb3: function() {
        console.log("Entered")
        
        if(typeof web3 != 'undefined') {
            App.web3Provider = window.ethereum; // !! new standard for modern eth browsers (2/11/18)
            web3 = new Web3(App.web3Provider);
            try {
                    ethereum.enable().then(async() => {
                        console.log("DApp connected to Metamask");
                    });
            }
            catch(error) {
                console.log(error);
            }
        } else {
            App.web3Provider = new Web3.providers.HttpProvider(App.url); // <==
            web3 = new Web3(App.web3Provider);
        }
        return App.initCreateContract();
    },

    /* Upload the contract's abstractions */
    initCreateContract: function() {

        // Get current account
        web3.eth.getCoinbase(function(err, account) {
            if(err == null) {
                App.account = account;
                $("#accountId").html("Your address: " + App.account);
            }
        });

        // Load content's abstractions
        $.getJSON("CreateLottery.json").done(function(c) {
            App.contracts["CreateContract"] = TruffleContract(c);
            App.contracts["CreateContract"].setProvider(App.web3Provider);
    
            return App.listenForCreateLotteryEvents();
        });
    },
    
    /* Upload the contract's abstractions */
    initLotteryContract: function() {
        App.getContractAddress();
        // Load content's abstractions
        $.getJSON("Try.json").done(function(c) {
            App.contracts["Contract"] = TruffleContract(c);
            App.contracts["Contract"].setProvider(App.web3Provider);
        });
    },

    listenForCreateLotteryEvents: function() {

        App.contracts["CreateContract"].deployed().then(async (instance) => {

                instance.newadd().on('data', function (event) {
                    $("#eventId").html("Event catched!");
                    console.log(event);
                    App.lottery_address=event["returnValues"]["newadd"];
                    alert("new lottery created");
                    return App.listenForLotteryEvents();

                    // If event has parameters: event.returnValues.valueName
                });
            // });
        });
        return App.initLotteryContract();

    },
    // Write an event listener
    listenForLotteryEvents: function() {

        App.contracts["Contract"].at(App.lottery_address).then(async (instance) => {

            instance.MintedColletible().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Minted Event catched");
                console.log(event);
                alert(event["returnValues"]["_nft_id"] +"th nft has been minted");
                // If event has parameters: event.returnValues.valueName
            });

            instance.TicketBuy().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
            });

            instance.GivePrize().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
            });

            instance.Tickets().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
            });

            instance.DrawNumbers().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
            });

            instance.StartRound().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
                console.log("Round Starting Event catched");
                console.log(event["returnValues"]["_round"]);
                document.getElementById("current_round").innerHTML="Current Round : "+event["returnValues"]["_round"]
            });

            instance.CloseLottery().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
                document.getElementById("nft_owner_address").innerHTML=event._buyer;
            });

            instance.RoundFinished().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
            });


            instance.TotalNfts().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Total NFTs Event catched");
                console.log(event["returnValues"]["_value"]);
                document.getElementById("total_nfts").innerHTML="Total Nfts : "+event["returnValues"]["_value"]
            });

            instance.GivePrize().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
            });
            
            instance.Tickets().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event tickets list catched");
                console.log(event);
            });

            instance.WinnerTicket().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event winner tickets catched");
                console.log(event["returnValues"]);
                alert("round number: "+event["returnValues"]["_round_number"]+" ticket_price:"+event["returnValues"]["_ticket"]);                
            });


        });

    },

    // Get a value from the smart contract
    getContractAddress: function() {

        App.contracts["CreateContract"].deployed().then(async(instance) =>{
            instance.getPastEvents('newadd',{    fromBlock: 0,     toBlock: 'latest'

            }).then(value => {
                
                if(value.length!=0){
                    App.lottery_address=value[value.length-1]["returnValues"]["newadd"];
                }
                console.log(App.lottery_address);

            });

        });
    },

    // Get a value from the smart contract
    createNewLottery: function() {
        App.getContractAddress();

        App.contracts["CreateContract"].deployed().then(async(instance) =>{
                await instance.createLottery(11,1,{from: App.account}).then(console.log);
                /*const v = await instance.value(); // Solidity uint are Js BN (BigNumbers) 
                console.log(v.toNumber());
                $("#valueId").html("" + v);*/
            });
    },

    // Call a function from a smart contract
        // The function send an event that triggers a transaction:: Metamask opens to confirm the transaction by the user
    getTickets: function() {
        App.getContractAddress();    
        
        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                await instance.getTicketCounter({from: App.account}).then(console.log);
                //console.log(instance.methods.pressClick({from: App.account}));
            });
        }
        else {
            alert("lottery is not created");
        }
    }, 



    
    mintNft: function() {
        App.getContractAddress();
        if(App.lottery_address!='0x0'){

        
            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                try{
                    await instance.mint(document.getElementById("nft_url").value,{from: App.account}).then(value=>{console.log(value)});
                }
                catch(e){
                    alert(e.message);
                }
            });

        }
        else {
            alert("lottery is not created");
        }
    } ,

    startNewRound: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                try{
                    await instance.startNewRound({from: App.account});
                }
                catch(e)
                {
                    console.log(e.message);
                    alert(e.message);
                }
            });
        }
        else {
            alert("lottery is not created");
        }
        
    } ,

    drawNumbers: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                try{
                    await instance.drawNumbers({from: App.account}).then(console.log);
                }
                catch(e){
                    console.log(e.message);
                    alert(e.message);
                }
            });
        }
        else {
            alert("lottery is not created");
        }
    } ,

    givePrizes: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                try{
                    await instance.givePrizes({from: App.account}).then(console.log);
                }
                catch(e){
                    alert(e.message);
                }
            });
        }
        else {
            alert("lottery is not created");
        }     
    } ,

    get_random: function() {

        App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
            await instance.get_random({from: App.account});
        });
        
    },

    ownerOff: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                await instance.ownerOf(document.getElementById("owner_off").value,{from: App.account}).then(value => {document.getElementById("owner_address").innerHTML=value});
            });
        }
        else {
            alert("lottery is not created");
        } 
    },

    setWinnerTicket: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                await instance.setWinnerTicket(eval(document.getElementById("winner_ticket").value),{from: App.account});

                console.log(eval(document.getElementById("winner_ticket").value));
            });
        }
        else {
            alert("lottery is not created");
        } 
    },

    closeLottery: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                try{
                    await instance.closeLottery({from: App.account}).then(console.log);
                }
                catch(e){
                    console.log(e)
                }
                //console.log(instance.methods.pressClick({from: App.account}));
            });
        }
        else {
            alert("lottery is not created");
        } 
    },

    mintAndPayNotAwardedWinner: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){
                console.log(App.account);
                App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                    try{

                        await instance.mintAndPayNotAwardedWinner("",{from: App.account}).then(console.log);
                    }
                    catch(e){
                        alert(e.message);
                    }
                });
        }

        else {
            alert("lottery is not created");
        } 
    },

    getRemainingBlocks: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                try{
                        await instance.getRemainingBlocks({from: App.account}).then(value => {alert("total remaining blocks: "+value)});
                    }
                    catch(e){
                        alert("total remaining blocks: 0");
                    }
            });
        }
        else {
            alert("lottery is not created");
        }
    },

    winnersNotAwarded: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                

                const v = await instance.not_awarded_counter(); 
                
                alert("number of winner not awarded: "+v);

            });
        }
        else {
            alert("lottery is not created");
        }
    },

    listOfWinners: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                instance.getPastEvents('RoundWinners',{    fromBlock: 0,     toBlock: 'latest'

                }).then(value => {
                    //alert(value[0]["returnValues"]["_buyer"])
                    var list = document.getElementById('list');
                    list.innerHTML = '';
                    
                    if(value.length==0){
                        document.getElementById("list_items").innerHTML="No winners, so far";

                    }
                    else{
                        document.getElementById("list_items").innerHTML="List of winners ( Round number, Winner address, Nft id)";
                    }
                    for(var i=value.length-1;i>-1;i--){
                        var entry = document.createElement('li');
                        console.log(value.length);
                        
                        entry.appendChild(document.createTextNode(value[i]["returnValues"]["_winner"]+"    "+value[i]["returnValues"]["_nft_id"]));
                        list.appendChild(entry);
                        
                    }
                });
            });
        }
        else {
            alert("lottery is not created");
        }
    } ,

    getTicketsList: function() {
        App.getContractAddress();

        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{
                instance.getPastEvents('TicketBuy',{    fromBlock: 0,     toBlock: 'latest'

                }).then(value => {
                    //alert(value[0]["returnValues"]["_buyer"])
                    var list = document.getElementById('list');
                    list.innerHTML = '';
                    
                    //const current_round_number =  App.getCurrentRound(); 
                    
                    if (value.length>0){

                        App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                            var v = await instance.current_round(); 
                            document.getElementById("list_items").innerHTML="List of tickets of round : "+v+" (order, buyer address, ticket numbers)";

                        });

                        console.log(value);
                        for(var i=value.length-1;i>-1;i--){
                            var entry = document.createElement('li');
                            console.log(value.length);

                            entry.appendChild(document.createTextNode(value[i]["returnValues"]["_buyer"]+"    ["+value[i]["returnValues"]["_ticket"]+"]"+"    "+value[i]["returnValues"]["_round_number"]));
                            list.appendChild(entry);             
                        }
                    }
                    else{
                        document.getElementById("list_items").innerHTML="No ticket for this round, so far";
                    }
                });
            });
        }
        else {
            alert("lottery is not created");
        }
    } 
}

// Call init whenever the window loads
$(function() {
    $(window).on('load', function () {
        App.init();
    });
});