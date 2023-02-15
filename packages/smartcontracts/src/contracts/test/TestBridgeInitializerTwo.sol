import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

// Inheritance chain is the same as the old version so that the state variables storage slots follow the same order
contract NewImplementation is UUPSUpgradeable, EIP712Upgradeable, AccessControlUpgradeable {
    event EVENT_BY_PAYABLE_FUNCTION();
    event ETH_RECEIVED(address indexed sender, uint256 indexed amount);
    using EnumerableSet for EnumerableSet.AddressSet;

    // respect the old storage slots order
    struct TokenAllowance {
        uint256 prevEpoch;
        uint256 dailyAllowance;
        uint256 currentDailyUsage;
        bool inChangeAllowancePeriod;
    }
    mapping(address => uint256) public eoaAddressToNonce;
    // Enumerable set of supportedTokens
    EnumerableSet.AddressSet internal supportedTokens;
    address public relayerAddress;
    mapping(address => TokenAllowance) public tokenAllowances;
    uint256 public transactionFee;
    bool public notPayableFunctionCalled;
    bool public payableFunctionCalled;

    receive() external payable {
        emit ETH_RECEIVED(msg.sender, msg.value);
    }

    function _authorizeUpgrade(address newImplementation) internal override {}

    function notPayableFunction() external {
        notPayableFunctionCalled = true;
    }

    function payableFunction() external payable {
        payableFunctionCalled = true;
    }

    /**
     * @notice to check whether a token is supported
     */
    function isSupported(address _tokenAddress) public view returns (bool) {
        return supportedTokens.contains(_tokenAddress);
    }
}
