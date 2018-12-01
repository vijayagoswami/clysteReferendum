App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Referendum.json", function(referendum) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Referendum = TruffleContract(referendum);
      // Connect provider to interact with contract
      App.contracts.Referendum.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Referendum.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var referendumInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Referendum.deployed().then(function(instance) {
      referendumInstance = instance;
      return referendumInstance.featuresCount();
    }).then(function(featuresCount) {
      var featuresResults = $("#featuresResults");
      featuresResults.empty();

      var featuresSelect = $('#featuresSelect');
      featuresSelect.empty();

      for (var i = 1; i <= featuresCount; i++) {
        referendumInstance.features(i).then(function(feature) {
          var id = feature[0];
          var name = feature[1];
	  var expiryTime = feature[2];
          var voteCount = feature[3];

          // Render feature Result
          var featureTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + expiryTime + "</td><td>" + voteCount + "</td></tr>"
          featuresResults.append(featureTemplate);

          // Render feature ballot option
          var featureOption = "<option value='" + id + "' >" + name + "</ option>"
          featuresSelect.append(featureOption);
        });
      }
      return referendumInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var featureId = $('#featuresSelect').val();
    App.contracts.Referendum.deployed().then(function(instance) {
      return instance.vote(featureId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
