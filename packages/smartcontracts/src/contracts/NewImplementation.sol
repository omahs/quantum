import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol';

// Inheritance chain is the same as the old version so that the state variables storage slots follow the same order
contract NewImplementation is UUPSUpgradeable, EIP712Upgradeable, AccessControlUpgradeable {
    // respect the old storage slots order
    struct TokenAllowance {
        uint256 prevEpoch;
        uint256 dailyAllowance;
        uint256 currentDailyUsage;
        bool inChangeAllowancePeriod;
    }
    mapping(address => uint256) public eoaAddressToNonce;
    mapping(address => bool) public supportedTokens;
    address public relayerAddress;
    mapping(address => TokenAllowance) public tokenAllowances;
    uint256 public transactionFee;

    function _authorizeUpgrade(address newImplementation) internal override {}
}
