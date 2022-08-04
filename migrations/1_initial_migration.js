let NFTContract = artifacts.require("NFT");
let CreateContract = artifacts.require("CreateLottery");




module.exports = async function (deployer) {
  
  let nft_address="";
  await deployer.deploy(NFTContract).then(value=>{nft_address=value["address"]});
  await deployer.deploy(CreateContract, nft_address);
};
