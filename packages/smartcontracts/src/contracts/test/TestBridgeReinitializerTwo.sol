// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import 'hardhat/console.sol';

contract TestBridgeReinitializerTwo is UUPSUpgradeable, EIP712Upgradeable, AccessControlUpgradeable {
    using EnumerableSet for EnumerableSet.AddressSet;
    struct TokenAllowance {
        uint256 latestResetTimestamp;
        uint256 dailyAllowance;
        uint256 currentDailyUsage;
    }

    // Mapping to track the address's nonce
    mapping(address => uint256) public eoaAddressToNonce;

    // Enumerable set of supportedTokens
    EnumerableSet.AddressSet internal supportedTokens;

    address public relayerAddress;

    bytes32 constant DATA_TYPE_HASH =
        keccak256('CLAIM(address to,uint256 amount,uint256 nonce,uint256 deadline,address tokenAddress)');

    // Mapping to track token address to TokenAllowance
    mapping(address => TokenAllowance) public tokenAllowances;

    bytes32 public constant OPERATIONAL_ROLE = keccak256('OPERATIONAL_ROLE');

    string public constant name = 'QUANTUM_BRIDGE';
    uint8 public version;

    // Initial Tx fee 0.3%. Based on dps (e.g 1% == 100dps)
    uint256 public transactionFee;
    // Community wallet to send tx fees to
    address public communityWallet;

    // Address to receive the flush
    address public flushReceiveAddress;

    // The remaining day variable used when flushing
    uint256 public acceptableRemainingDays;

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    /**
     * @notice To initialize this contract (No constructor as part of the proxy pattery )
     * @param _initialAdmin Initial admin address of this contract
     * @param _initialOperational Initial operational address of this contract
     * @param _relayerAddress Relayer address for signature
     * @param _communityWallet Community address for tx fees
     * @param _fee Fee charged on each transcation (initial fee: 0.3%)
     */
    function initialize(
        address _initialAdmin,
        address _initialOperational,
        address _relayerAddress,
        address _communityWallet,
        uint256 _fee,
        address _flushReceiveAddress,
        uint256 _acceptableRemainingDays,
        uint8 _version
    ) external reinitializer(_version) {
        __UUPSUpgradeable_init();
        __EIP712_init(name, Strings.toString(_version));
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(OPERATIONAL_ROLE, _initialOperational);
        communityWallet = _communityWallet;
        relayerAddress = _relayerAddress;
        transactionFee = _fee;
        flushReceiveAddress = _flushReceiveAddress;
        acceptableRemainingDays = _acceptableRemainingDays;
        version = _version;
    }
}
