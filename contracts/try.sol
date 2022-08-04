// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./nftinterface.sol";

contract Try {
    address public contract_address;
    address public owner;
    
    
    event Tickets(address indexed _from , uint[] _value);
    event TicketBuy(address _buyer, uint[] _ticket, uint _sold_tickets,uint _round_number);
    event DrawNumbers(string _status);
    event MintedColletible(uint _nft_id, string _status);
    event StartRound(uint _round);
    event CloseLottery(address _buyer);
    event RoundFinished(uint _revenue);
    event TotalNfts(uint _value);
    event GivePrize(uint _nft_id, address _winner);

    event RoundWinners(uint _round_number, address _winner, uint _nft_id);

    //use mapping for tickets
    mapping(uint => uint[]) public tickets;
    //use mapping for addresses
    mapping(uint => address) public addresses;
    //use mapping for drawn numbers
    mapping(uint => uint[]) public drawn_numbers;
    //use mapping for classes
    mapping(uint => uint[]) public classes;

    
    mapping(uint => address) public winners_not_awarded;

    event WinnerTicket(uint _round_number , uint[] _ticket);

    uint public current_round=0;

    uint256 counter=0;
    uint starting_block=0;
    uint[] collectible_ids; 
    uint[] assigned_collectibles;
    uint[] numbers;
    uint[] random_numbers;
    uint[] random_11;
    uint[] cl;
    uint256 ticket_price;
    uint M=0;
    uint[] ticket_prices;
    bool   is_number_drawn=false;
    uint public not_awarded_counter=0;

    uint awarded_id=0;


    constructor(uint256 price,uint m_blocks, address nft_contract_address, address owner_address) public {
        owner=owner_address;
        starting_block=block.number;
        current_round=1;
        ticket_prices.push(ticket_price);
        ticket_price=price;
        M=m_blocks;
        contract_address=nft_contract_address;

    }


    
    function randn(uint256 m) public view returns(uint256){
        /*if the environment is javascript vm , blockhash doesn't work so it returns
         without using the block hash.

         */ 
        if (block.number<10000){
            return block.timestamp+m;
        }
        bytes32 bhash=blockhash(block.number-1+m);
        bytes memory bytesArray = new bytes(32);
        for (uint i; i <32; i++)
        {bytesArray[i] =bhash[i];}
        bytes32 rand = keccak256(bytesArray);

        return uint(rand);
    }


    function mint (string memory tokenURI) public  returns (uint256)  {
        require(owner == msg.sender, "ERC721: address zero is not a valid owner");
        // I used jpg as a URI of the nft
        uint256 newItemId;
        //for(uint i=0;i<11;i++){
        newItemId =ERC721(contract_address).mint(tokenURI);
        collectible_ids.push(newItemId);
        emit TotalNfts(collectible_ids.length);
        emit MintedColletible(newItemId,"minted");
        //}
        //If the operator mints at least 11 nfts then distrubte the nfts randomly
        if ((collectible_ids.length-assigned_collectibles.length) >=11){
            //call get_random() method to generate random numbers to link the nft and the classes
            //get_random();
            //assign the minted collectibles to the classes
            //uint j=0;
            //for(uint i=1;i<=8;i++){
            //    if(i==4||i==5||i==6){
            //        classes[i]=[collectible_ids[random_11[j]],collectible_ids[random_11[j+1]]];
            //        j+=2;
            //    }
            //    else{
            //        classes[i]=[collectible_ids[random_11[j]]];
            //        j+=1;
            //    }

            //}

            classes[1]=[collectible_ids[0]];
            classes[2]=[collectible_ids[1]];
            classes[3]=[collectible_ids[2]];
            classes[4]=[collectible_ids[3],collectible_ids[4]];
            classes[5]=[collectible_ids[5],collectible_ids[6]];
            classes[6]=[collectible_ids[7],collectible_ids[8]];
            classes[7]=[collectible_ids[9]];
            classes[8]=[collectible_ids[10]];
            

        }
        return newItemId;
    }

    function buy (uint[] memory a) public payable returns (uint256){
        
        //check if round is active
        require(starting_block+M>block.number,"inactive round");

        uint i=0;
       
        //get inputs of an array
        //check if match balls are less than 70. 
        for (i=0; i<5;i++){
            require(a[i]<70,"invalid input");
        }
        //check if the power ball is less than 26
        require(a[5]<27,"invalid input");
        
        //check if the user is bying the ticket with right value
        require(msg.value >= ticket_price, "value is not sufficent");
        
        //add the buyers address to addresses mapping
        addresses[counter]=msg.sender;
        //add the ticket numbers to tickets maping
        //use counter as a primary key
        tickets[counter]=a;
        //increment the counter
        counter+=1;
        emit TicketBuy(msg.sender,a,counter,current_round);

    }

    function getTickets() public {
        for (uint i =0;i<counter;i++){
            emit Tickets(addresses[i],tickets[i]);
        }             
    }

    function startNewRound() public {
        require(owner == msg.sender, "Only the operator can give the prize");
        //check if there is no any active round    
        require(starting_block+M<block.number,"there is an active round");


        starting_block=block.number;
        current_round+=1;
        //remove the addresses and tickets of the previous round
        for(uint i=0;i<counter;i++){
            delete addresses[i];
            delete tickets[i];
        }
        
        //emit the round number
        emit  StartRound(current_round);
        is_number_drawn=false;
        counter=0;
        
    }

    function drawNumbers() public  {
        require(owner == msg.sender, "Only the operator can draw the numbers");
        require(block.number > starting_block+M, "Round is not finished");
        require((collectible_ids.length-assigned_collectibles.length) >=11 , "minted nfts are not suffucient, please mint!");

        //use the current block number to generate the first random number
        uint a=randn(0) % 70;
        uint b;
        bool temp=false;
        //add the first random number to the random number list
        random_numbers.push(a);
        
        //drawn other numbers using the first random number
        for(uint i=1;i<6;i++){
            //for match ball
            if(i<5){
                b=randn(a)%70;
            }
            //for power ball
            else{
                b=randn(a)%27;
            }
            a=b;
            //check if the new random number has not been generated before
            random_numbers.push(b);
        }
        drawn_numbers[current_round]=random_numbers;
        emit DrawNumbers("Drawing finished");
        emit WinnerTicket(current_round,random_numbers);
        is_number_drawn=true;
    }

    //give prize for each winner
    function givePrizes() public  {
        //check if the caller is the owner
        require(owner == msg.sender, "Only the operator can give the prize");
        
        require(block.number > starting_block+M, "Round is not finished");
        require(is_number_drawn==true, "draw numbers first");
        
        uint count;
        bool gold;
        address winner;
        uint class_number;
        uint collectible_id;
        //check the ticket of each player
        for(uint j=0;j<counter;j++){
            count=0;
            gold=false;
            //set address as a winer
            winner=addresses[j];
            class_number=0;
            //check each class if the address has won
            for(uint k=0;k<5;k++){
                for (uint n=0;n<5;n++){
                    //get the number of the match
                    if(tickets[j][k]==drawn_numbers[current_round][n]){
                        count+=1;
                    }
                }
            }        
            if(tickets[j][5]==drawn_numbers[current_round][5]){
                gold=true;
            }
            //get the class number based on the number of the matches
            if(count==5){
                //class1
                if (gold==true){    
                    class_number=1;
                }
                else{
                    class_number=2;
                }
            }
            else if(count==4){
                if (gold==true){
                    class_number=3;
                }
                else{
                    class_number=4;
                }
            }
            else if(count==3){
                if (gold==true){
                    class_number=4;
                }
                else{
                    class_number=5;
                }
            }
            else if(count==2){
                if (gold==true){
                    class_number=5;

                }
                else{
                    class_number=6;

                }
            }
            else if(count==1){
                if (gold==true){
                    class_number=6;

                }
                else{
                    class_number=7;
                }
            }
            else{
                if (gold==true){
                    class_number=8;
                    
                }
                
            }
            //if class_number is different from 0 then the address has won
            if(class_number!=0){
                uint256 rand=randn(0);
                cl=classes[class_number];
                //get the collectible 
                if(collectible_ids.length>awarded_id){
                    collectible_id=collectible_ids[awarded_id];
                    //transfer the collectible to the winner
                    ERC721(contract_address).safeTransferFrom(address(this),winner,collectible_id);
                    emit GivePrize(collectible_id, winner);
                    assigned_collectibles.push(collectible_id);
                    emit RoundWinners(current_round,winner,collectible_id);
                    awarded_id+=1;
                }
                else{
                    not_awarded_counter++;
                    winners_not_awarded[not_awarded_counter]=winner;
                }
                
            }
        }
        //set starting_block=0, then  the round becomes inactive
        starting_block=0;
        //transfer the revenue to the operator
        payable(owner).transfer(address(this).balance);
        emit RoundFinished(address(this).balance);
        is_number_drawn=false;
        counter=0;
    }

    //get random 11 numbers for distriubiting the collectibles randomly
    function get_random() public {
        //get the first random number
        uint256 a=randn(0) % 11;
        uint b;
        bool temp=false;
        random_11.push(a);

        //get the next random number from the previous
        for(uint i=1;i<11;i++){
            
            b=randn(a)%11;
            
            //check for collision and retry random number generation 
            temp=false;
            for(uint j=0;j<random_11.length;j++){
                if(b==random_11[j]){
                    temp=true;
                }
            }
            if(temp==true){
                a+=1;
                i-=1;
            }
            else{
                random_11.push(b);
            }
        }

    }

    //get owner of a collectible
    function ownerOf(uint256 i) public view returns(address){
        address addr=ERC721(contract_address).ownerOf(i);
        return addr;
    }

    //set winner for simulation purpose
    function setWinnerTicket(uint[] memory a) public returns (uint[] memory){    
        require(owner == msg.sender, "Only the operator can draw the numbers");

        //set the input array as the winning drawn numbers
        drawn_numbers[current_round]=a;
        is_number_drawn=true;

        return a;
    }


   function closeLottery() public payable returns(uint256){
        require(owner == msg.sender, "Only the operator can give the prize");
        //send the ether back to each player
        for(uint i=0;i<counter;i++){
           payable(addresses[i]).transfer(ticket_price);
           emit CloseLottery(addresses[i]);
        }
        //close the lottery and send the remainng ethers to the owner
        selfdestruct(payable(owner));
        return counter*ticket_price;
    } 

    function getTicketPrice() public view returns(uint256){
        return ticket_price;
    }

   function getTicketCounter() public view returns(uint){
       return counter;
   }

   function mintAndPayNotAwardedWinner(string memory tokenURI) public  {
        require(owner == msg.sender, "Only the operator can do these oeration");

        uint256 new_item_id =ERC721(contract_address).mint(tokenURI);
        address winner=winners_not_awarded[not_awarded_counter];
        ERC721(contract_address).safeTransferFrom(address(this),winner,new_item_id);
        emit GivePrize(new_item_id,address(this));
        assigned_collectibles.push(new_item_id);
        delete winners_not_awarded[not_awarded_counter];
        not_awarded_counter--;
   }

   function getRemainingBlocks() public view returns(uint){
       uint n=(starting_block+M) - block.number + 1 ;
       return n;
   }

}
