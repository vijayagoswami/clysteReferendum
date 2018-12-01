var Referendum = artifacts.require("./Referendum.sol");

module.exports = function(deployer) {
  deployer.deploy(Referendum);
};
