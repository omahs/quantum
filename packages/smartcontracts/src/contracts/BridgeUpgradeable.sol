// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "hardhat/console.sol";

/** @notice @dev
/* Errors code. Might switch to custom errors.
/* BC000: STILL IN CHANGE ALOWANCE PERIOD
/* BC001: INCORRECT NONCE
/* BC002: This token is not supported
/* BC003: Fake Signature
/* BC004: exceed daily allowance
/* BC005: Token is already supported
/* BC006: No Zero Address
/* BC007: NON AUTHORIZED ADDRESS
**/

/** @notice @dev  
 /* This error occurs when the msg.sender doesn't have neither DEFAULT_ADMIN_ROLE or OPERATIONAL_ROLE assigned
*/
error NON_AUTHORIZED_ADDRESS();

contract BridgeUpgradeable is
    UUPSUpgradeable,
    EIP712Upgradeable,
    AccessControlUpgradeable
{
    struct TokenAllowance {
        uint256 prev_epoch;
        uint256 daily_allowance;
        uint256 curr_daily_usage;
        bool in_change_allowance_period;
    }

    mapping(address => uint256) public eoaAddressToNonce;
    mapping(address => bool) public supportedTokens;
    address public relayerAddress;
    bytes32 constant DATA_TYPE_HASH =
        keccak256(
            "CLAIM(address to,uint256 amount,uint256 nonce,uint256 deadline,address tokenAddress)"
        );
    mapping(address => TokenAllowance) public tokenAllowances;

    bytes32 public constant OPERATIONAL_ROLE = keccak256("OPERATIONAL_ROLE");

    modifier notInChangeAllowancePeriod(address _tokenAddress) {
        if (tokenAllowances[_tokenAddress].in_change_allowance_period) {
            require(
                block.timestamp - tokenAllowances[_tokenAddress].prev_epoch >=
                    1 days,
                "BC000"
            );
            tokenAllowances[_tokenAddress].in_change_allowance_period = false;
            _;
        } else {
            _;
        }
    }

    event BRIDGE_TO_DEFI_CHAIN(
        bytes _defiAddress,
        address _tokenAddress,
        uint256 _amount,
        uint256 _timestamp
    );

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    function initialize(
        string memory _name,
        string memory _version,
        address _initialAdmin,
        address _initialOperational,
        address _relayerAddress
    ) external initializer {
        __UUPSUpgradeable_init();
        __EIP712_init(_name, _version);
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(OPERATIONAL_ROLE, _initialOperational);
        relayerAddress = _relayerAddress;
    }

    function claimFund(
        address _to,
        uint256 _amount,
        uint256 _nonce,
        uint256 _deadline,
        address _tokenAddress,
        bytes memory signature
    ) external {
        require(eoaAddressToNonce[_to] == _nonce, "BC001");
        require(supportedTokens[_tokenAddress], "BC002");
        require(block.timestamp <= _deadline);
        bytes32 struct_hash = keccak256(
            abi.encode(
                DATA_TYPE_HASH,
                _to,
                _amount,
                _nonce,
                _deadline,
                _tokenAddress
            )
        );
        bytes32 msg_hash = _hashTypedDataV4(struct_hash);
        require(
            ECDSAUpgradeable.recover(msg_hash, signature) == relayerAddress,
            "BC003"
        );
        IERC20(_tokenAddress).transfer(_to, _amount);
        eoaAddressToNonce[_to]++;
    }

    function bridgeToDeFiChain(
        bytes memory _defiAddress,
        address _tokenAddress,
        uint256 _amount
    ) public notInChangeAllowancePeriod(_tokenAddress) {
        require(supportedTokens[_tokenAddress], "BC002");
        if (
            tokenAllowances[_tokenAddress].prev_epoch + (1 days) >
            block.timestamp
        ) {
            tokenAllowances[_tokenAddress].curr_daily_usage += _amount;
            require(
                tokenAllowances[_tokenAddress].curr_daily_usage <=
                    tokenAllowances[_tokenAddress].daily_allowance,
                "BC004"
            );
        } else {
            tokenAllowances[_tokenAddress].prev_epoch +=
                ((block.timestamp - tokenAllowances[_tokenAddress].prev_epoch) /
                    (1 days)) *
                (1 days);
            tokenAllowances[_tokenAddress].curr_daily_usage = _amount;
            require(
                tokenAllowances[_tokenAddress].curr_daily_usage <=
                    tokenAllowances[_tokenAddress].daily_allowance,
                "BC004"
            );
        }
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
        emit BRIDGE_TO_DEFI_CHAIN(
            _defiAddress,
            _tokenAddress,
            _amount,
            block.timestamp
        );
    }

    function addSupportedTokens(address _token, uint256 _dailyAllowance)
        external
    {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        require(!supportedTokens[_token], "BC005");
        supportedTokens[_token] = true;
        tokenAllowances[_token].prev_epoch = block.timestamp;
        tokenAllowances[_token].daily_allowance = _dailyAllowance;
        tokenAllowances[_token].curr_daily_usage = 0;
        tokenAllowances[_token].in_change_allowance_period = false;
    }

    function removeSupportedTokens(address _token) external {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        require(supportedTokens[_token], "BC002");
        supportedTokens[_token] = false;
        tokenAllowances[_token].prev_epoch = 0;
        tokenAllowances[_token].daily_allowance = 0;
        tokenAllowances[_token].curr_daily_usage = 0;
        tokenAllowances[_token].in_change_allowance_period = false;
    }

    function changeDailyAllowance(
        address _tokenAddress,
        uint256 _dailyAllowance
    ) external notInChangeAllowancePeriod(_tokenAddress) {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        tokenAllowances[_tokenAddress].in_change_allowance_period = true;
        tokenAllowances[_tokenAddress].daily_allowance = _dailyAllowance;
    }

    function withdraw(address token, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        //uint256 bridgeBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, amount);
    }

    function changeRelayerAddress(address _relayerAddress) external {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        require(_relayerAddress != address(0), "BC006");
        relayerAddress = _relayerAddress;
    }

    function checkRoles() internal view returns (bool check) {
        return
            check =
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(OPERATIONAL_ROLE, msg.sender);
    }
}
