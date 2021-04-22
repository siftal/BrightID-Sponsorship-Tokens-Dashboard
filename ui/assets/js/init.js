var spMinterContract = null;
var subsMinterContract = null;
var spContract = null;
var spContract2 = null;
var idSpContract = null;
var subsContract = null;
var idSubsContract = null;
var ptContract = null;
var spPrice, subsPrice;
var enoughFund = false;
var val = 0;
var dai = 0;
var business = true;
var reference = null;
var fAmountSp = 0;
var tAmountSp = 0;
var fAmountSubs = 0;
var tAmountSubs = 0;
var networkId = 1;

if (window.ethereum) {
  ethereum.autoRefreshOnNetworkChange = false;
  ethereum.on("networkChanged", init);
  ethereum.on("accountsChanged", init);
}

window.addEventListener('load', init);

async function init() {
  await unlockProvider();
}

async function unlockProvider() {
  $body = $("body");
  $body.addClass("loading");
  if (window.ethereum) {
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
    web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable();
    } catch (error) {
      window.provider = false;
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
    }
  } else {
    window.provider = false;
    Swal.fire({
      type: "error",
      title: "MetaMask is not installed",
      text: "Please install MetaMask from below link",
      footer: '<a href="https://metamask.io">Install MetaMask</a>'
    });
    return;
  }

  await web3.eth.getAccounts(function(error, accounts) {
    if (error != null) {
      window.provider = false;
      Swal.fire({
        type: "error",
        title: "Something went wrong",
        text: error.message || error,
        footer: ""
      });
      return;
    }
    if (accounts.length === 0) {
      window.provider = false;
      Swal.fire({
        type: "info",
        title: "Your wallet provider is locked",
        text: "Please unlock your wallet",
        footer: ""
      });
      return;
    } else {
      web3.eth.defaultAccount = accounts[0];
    }
    web3.eth.net.getId(function(error, id) {
      if (error != null) {
        window.provider = false;
        Swal.fire({
          type: "error",
          title: "Something went wrong",
          text: error.message || error,
          footer: ""
        });
        return;
      }
      networkId = id;
      load_data();
      console.log('networkId', networkId);
      if (networkId == 1) {
        $(".uniswapLink").attr("href", "https://info.uniswap.org/pair/0x9bf9df78b45f9c3848094cbcd90e2cc5da29eb77");
        $("#spContractAddress").html(`<a href="https://etherscan.io/token/${addresses.mainnet.sp}" target="_blank">${addresses.mainnet.sp}</a>`);
        $("#subsContractAddress").html(`<a href="https://etherscan.io/token/${addresses.mainnet.subs}" target="_blank">${addresses.mainnet.subs}</a>`);
        $(".wrapBtn").hide();
        $("#addIdchainBtn").show();
        ptContract = new web3.eth.Contract(abies.mainnet.pt, addresses.mainnet.pt);
        spContract = new web3.eth.Contract(abies.mainnet.sp, addresses.mainnet.sp);
        spContract2 = new idchainWeb3.eth.Contract(abies.idchain.sp, addresses.idchain.sp);
        subsContract = new web3.eth.Contract(abies.mainnet.subs, addresses.mainnet.subs);
        spMinterContract = new web3.eth.Contract(abies.mainnet.sp_minter, addresses.mainnet.sp_minter);
        subsMinterContract = new web3.eth.Contract(abies.mainnet.subs_minter, addresses.mainnet.subs_minter);

      } else if (networkId == 74) {
        $(".uniswapLink").attr("href", "#");
        $("#spContractAddress").html(`<a href="https://explorer.idchain.one/address/${addresses.idchain.sp}/transactions" target="_blank">${addresses.idchain.sp}</a>`);
        $("#subsContractAddress").html(`<a href="https://explorer.idchain.one/address/${addresses.idchain.subs}/transactions" target="_blank">${addresses.idchain.subs}</a>`);
        $(".wrapBtn").show();
        $("#addIdchainBtn").hide();
        ptContract = new web3.eth.Contract(abies.idchain.pt, addresses.idchain.pt);
        spContract = new web3.eth.Contract(abies.idchain.sp, addresses.idchain.sp);
        spContract2 = new mainnetWeb3.eth.Contract(abies.mainnet.sp, addresses.mainnet.sp);
        subsContract = new web3.eth.Contract(abies.idchain.subs, addresses.idchain.subs);
        spMinterContract = new web3.eth.Contract(abies.idchain.sp_minter, addresses.idchain.sp_minter);
        subsMinterContract = new web3.eth.Contract(abies.idchain.subs_minter, addresses.idchain.subs_minter);
        bridgeSpContract = new web3.eth.Contract(abies.idchain.bridge_sp, addresses.idchain.bridge_sp);
        bridgeSubsContract = new web3.eth.Contract(abies.idchain.bridge_subs, addresses.idchain.bridge_subs);
        wrapperContract = new web3.eth.Contract(abies.idchain.wrapper, addresses.idchain.wrapper);
      } else {
        $(".uniswapLink").attr("href", "https://info.uniswap.org/pair/0x9bf9df78b45f9c3848094cbcd90e2cc5da29eb77");
        $(".wrapBtn").hide();
        $("#addIdchainBtn").show();
        window.provider = false;
        Swal.fire({
          type: "info",
          title: "Wrong network",
          text: "Please select the IDChain or main network in your wallet and try again.",
          footer: ""
        });
        $body.removeClass("loading");
        return;
      }
      window.provider = true;
      $body.removeClass("loading");
    });
  });
}