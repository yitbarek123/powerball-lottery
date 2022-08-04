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
    
    listenForCreateLotteryEvents: function() {

        App.contracts["CreateContract"].deployed().then(async (instance) => {

                instance.newadd().on('data', function (event) {
                    $("#eventId").html("Event catched!");
                    console.log(event);
                    App.lottery_address=event["returnValues"]["newadd"];
                    alert("new lottery created");
                    document.getElementById("lottery_closed").innerHTML="";

                    return App.listenForLotteryEvents();

                    // If event has parameters: event.returnValues.valueName
                });
            // });
        });
        return App.initLotteryContract();

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

    

    // Write an event listener
    listenForLotteryEvents: function() {

        App.contracts["Contract"].at(App.lottery_address).then(async (instance) => {

            instance.DrawNumbers().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
                    
            });

            instance.WinnerTicket().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event winner tickets catched");
                console.log(event["returnValues"]);
                document.getElementById("last_winner").innerHTML="round number: "+event["returnValues"]["_round_number"]+" ticket_:"+event["returnValues"]["_ticket"];                
            
            });

            instance.StartRound().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
                console.log("Round Starting Event catched");
                console.log(event["returnValues"]["_round"]);
                document.getElementById("new_round").innerHTML="New round : "+event["returnValues"]["_round"];
            });
    
            instance.CloseLottery().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
                document.getElementById("lottery_closed").innerHTML="Lottery closed ";
            });
    
            instance.RoundWinners().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Event catched");
                console.log(event);
                document.getElementById("round_finished").innerHTML="Round "+event["returnValues"]["_round_number"]+" th winner: "+event["returnValues"]["_winner"];
            });
    
            instance.TotalNfts().on('data', function (event) {
                $("#eventId").html("Event catched!");
                console.log("Total NFTs Event catched");
                console.log(event["returnValues"]["_value"]);
                document.getElementById("total_nfts").innerHTML="A new NFT is minted. Total Nfts : "+event["returnValues"]["_value"];
            });

        });


        return App.render();
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


    buyTicket: function() {
        App.getContractAddress();
        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                try{
                        var num1=document.getElementById("num1").value;
                        var num2=document.getElementById("num2").value;
                        var num3=document.getElementById("num3").value;
                        var num4=document.getElementById("num4").value;
                        var num5=document.getElementById("num5").value;
                        var num6=document.getElementById("num6").value;
                        await instance.buy([num1,num2,num3,num4,num5,num6],{from: App.account,value:1});
                }
                catch(e){
                    if(e.message.includes("Lottery is not created")){
                        alert("Lottery is not created");
                    }
                    console.log(e.message);
                }
            });
        }
        else {
            alert("lottery is not created");
        }
        
    } ,

    getCurrentRound: function() {
        App.getContractAddress();
        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                const v = await instance.current_round(); 
                console.log(v.toNumber());    
                alert("current round number is: "+v)        
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
    } ,
    
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

                    for(var i=0;i<value.length;i++){
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
                instance.getPastEvents('Tickets',{    fromBlock: 0,     toBlock: 'latest'

                }).then(value => {
                    var list = document.getElementById('list');
                    list.innerHTML = '';
                    
                    document.getElementById("list_items").innerHTML="List of tickets (order, buyer address, ticket numbers)";

                    for(var i=0;i<value.length;i++){
                        var entry = document.createElement('li');
                        console.log(value.length);
                        entry.appendChild(document.createTextNode(value[i]["returnValues"]["_from"]+"    ["+value[i]["returnValues"]["_value"]+"]"));
                        list.appendChild(entry);                    
                    }
                });
            });
        }
        else {
            alert("lottery is not created");
        }
    },

    getNftAddress: function() {
        App.getContractAddress();
        if(App.lottery_address!='0x0'){

            App.contracts["Contract"].at(App.lottery_address).then(async(instance) =>{

                const v = await instance.contract_address(); 
                console.log(v);    
                alert("The Nft contract address is: "+v)        
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