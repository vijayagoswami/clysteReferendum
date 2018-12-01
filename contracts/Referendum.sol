pragma solidity 0.4.24;

contract Referendum {
    // Model a Feature
    struct Feature {
        uint id;
        string name;
	uint expirytime;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Features
    // Fetch Feature
    mapping(uint => Feature) public features;
    // Store Feature Count
    uint public featuresCount;

    // voted event
    event votedEvent (
        uint indexed _featureId
    );

    function Referendum () public {
        addFeature("New Fonts", 2);
	addFeature("Survey", 3);
        addFeature("Map", 5);
	addFeature("Ride Sharing", 5);
	addFeature("Vote Timer", 1);
	addFeature("TV Streaming", 7);
	addFeature("Affiliate Marketing", 7);
    }

    function addFeature (string _name, uint _expirytime) private {
        featuresCount++;
        features[featuresCount] = Feature(featuresCount, _name, _expirytime, 0);
    }

    function vote (uint _featureId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid feature
        require(_featureId > 0 && _featureId <= featuresCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update feature vote Count
        features[_featureId].voteCount ++;

        // trigger voted event
        votedEvent(_featureId);
    }
}
