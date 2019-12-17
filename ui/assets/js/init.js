var spMinterContract = null;
var subsMinterContract = null;
var spContract = null;
var subsContract = null;
var ptContract = null;
var spPrice, subsPrice;
var enoughFund = false;
var val = 0;
var dai = 0;
var business = true;

ethereum.autoRefreshOnNetworkChange = false;

window.addEventListener('load', init);
ethereum.on("networkChanged", init);
ethereum.on("accountsChanged", init);

async function init(){
  if (ethereum) {
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
    web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
    } catch (error) {
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
    }
  } else if (web3) {
    web3 = new Web3(web3.currentProvider);
  } else {
    Swal.fire({
      type: "error",
      title: "MetaMask is not installed",
      text: "Please install MetaMask from below link",
      footer: '<a href="https://metamask.io">Install MetaMask</a>'
    });
    return;
  }

  await web3.eth.getAccounts(function(error, accounts){
    if (error != null) {
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
      return;
    }
    if (accounts.length === 0) {
      Swal.fire({
        type: "info",
        title: "Your wallet provider is locked",
        text: "Please unlock your wallet",
        footer: ""
      });
      return;
    }
    web3.eth.defaultAccount = accounts[0];
  });

  ptContract = new web3.eth.Contract(abies.pt, addresses.pt);
  spContract = new web3.eth.Contract(abies.sp, addresses.sp);
  subsContract = new web3.eth.Contract(abies.subs, addresses.subs);
  spMinterContract = new web3.eth.Contract(abies.sp_minter, addresses.sp_minter);
  subsMinterContract = new web3.eth.Contract(abies.subs_minter, addresses.subs_minter);

  // var InfuraWeb3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  // var sp_minter_contract = InfuraWeb3.eth.contract(abies.sp_minter);
  // spMinterContract = sp_minter_contract.at(addresses.sp_minter);

  // var subs_minter_contract = InfuraWeb3.eth.contract(abies.subs_minter);
  // subsMinterContract = subs_minter_contract.at(addresses.subs_minter);

  // var sp_contract = InfuraWeb3.eth.contract(abies.sp);
  // spContract = sp_contract.at(addresses.sp);

  // var subs_contract = InfuraWeb3.eth.contract(abies.subs);
  // subsContract = subs_contract.at(addresses.subs);

  // var pt_contract = InfuraWeb3.eth.contract(abies.pt);
  // ptContract = pt_contract.at(addresses.pt);


  spMinterContract.methods.price().call(function(error, result){
    if (error) {
      return;
    }
    spPrice = result / (10 ** 18);
    $("#spPrice").html(spPrice);
  });

  // spMinterContract.methods.totalSold(function (error, result) {
  //   if (error) {
  //     return;
  //   }
  //   $("#spTotalSold").html(parseInt(result.c[0]));
  // });

  subsMinterContract.methods.price().call(function(error, result){
    if (error) {
      return;
    }
    subsPrice = result / (10 ** 18);
    $("#subsPrice").html(subsPrice);
  });

  subsMinterContract.methods.totalSold().call(function(error, result){
    if (error) {
      return;
    }
    $("#subsLeft").html(numberDecorator(900000 - result));
  });

  subsContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result){
    if (error) {
      return;
    }
    $("#subsInactiveBalance").html(numberDecorator(result));
  });

  spContract.methods.balanceOf(web3.eth.defaultAccount).call(function(error, result){
    if (error) {
      return;
    }
    $("#spBalance").html(numberDecorator(result));
  });

  $("#spContractAddress").html(`<a href="https://etherscan.io/token/${addresses.sp}" target="_blank">${addresses.sp}</a>`);
  $("#subsContractAddress").html(`<a href="https://etherscan.io/token/${addresses.subs}" target="_blank">${addresses.subs}</a>`);

  subsContract.getPastEvents('SubscriptionsActivated', updateActiveBalance);
}

function updateActiveBalance(err, events){
  if (err){
    return;
  }
  // We have to get all the events into memory and do the filtering ourselves because we didn't put the word "indexed"
  // next to the "account" parameter in the smart contract.
  const totalAmount = events.filter(event => event.returnValues.account === web3.eth.defaultAccount)
    .reduce((total, event) => parseInt(event.returnValues.amount) + total, 0);
  $("#subsActiveBalance").html(numberDecorator(totalAmount));
}