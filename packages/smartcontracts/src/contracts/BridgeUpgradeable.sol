// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "hardhat/console.sol";

/**
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

/** @notice @dev 
/* This error occurs when Admin(s) try to change daily allowance of un-supported token.
*/
error ONLY_SUPPORTED_TOKENS();

/** @notice @dev 
/* This error occurs when the initail daily allowance for ETHER hasn't been set.
*/
error NOT_ENOUGH_ETHEREUM();

contract BridgeUpgradeable is
    UUPSUpgradeable,
    EIP712Upgradeable,
    AccessControlUpgradeable
{
    struct TokenAllowance {
        uint256 prevEpoch;
        uint256 dailyAllowance;
        uint256 currentDailyUsage;
        bool inChangeAllowancePeriod;
    }
    address constant ETHER = address(0);

    // Mapping to track the address's nonce
    mapping(address => uint256) public eoaAddressToNonce;

    // Mapping to track supported token
    mapping(address => bool) public supportedTokens;

    address public relayerAddress;

    bytes32 constant DATA_TYPE_HASH =
        keccak256(
            "CLAIM(address to,uint256 amount,uint256 nonce,uint256 deadline,address tokenAddress)"
        );

    // Mapping to track token address to TokenAllowance
    mapping(address => TokenAllowance) public tokenAllowances;

    bytes32 public constant OPERATIONAL_ROLE = keccak256("OPERATIONAL_ROLE");

    // Initial Tx fee 0.3%. Based on dps (e.g 1% == 100dps)
    uint256 public transactionFee;

    /**
     * @notice Use to check if the token is still in allowance period.
     * @param _tokenAddress address of the respected token
     */
    modifier notInChangeAllowancePeriod(address _tokenAddress) {
        if (tokenAllowances[_tokenAddress].inChangeAllowancePeriod) {
            require(
                block.timestamp - tokenAllowances[_tokenAddress].prevEpoch >=
                    1 days,
                "BC000"
            );
            tokenAllowances[_tokenAddress].inChangeAllowancePeriod = false;
            _;
        } else {
            _;
        }
    }

    /**
     * @notice Emitted when the user claims funds from the bridge
     * @param tokenAddress Token that is being claimed
     * @param to Address that funds  will be transferred to
     * @param amount Amount of the token being claimed
     */
    event CLAIM_FUND(
        address indexed tokenAddress,
        address indexed to,
        uint256 indexed amount
    );

    /**
     * @notice Emitted when the user bridges token to DefiChain
     * @param defiAddress defiAddress DeFiChain address of user
     * @param symbol Supported token's being bridged
     * @param amount Amount of the token being bridged
     * @param timestamp TimeStamp of the transcation
     */
    event BRIDGE_TO_DEFI_CHAIN(
        bytes defiAddress,
        string symbol,
        uint256 indexed amount,
        uint256 indexed timestamp
    );

    /**
     * @notice Emitted when a new token is being added to the supported list by only Admin accounts
     * @param supportedToken Address of the token being added to the supported list
     * @param dailyAllowance Daily allowance of the token
     */
    event ADD_SUPPORTED_TOKEN(
        address indexed supportedToken,
        uint256 indexed dailyAllowance
    );

    /**
     * @notice Emitted when the existing supported token is removed from the supported list by only Admin accounts
     * @param token Address of the token removed from the supported list
     */
    event REMOVE_SUPPORTED_TOKEN(address indexed token);

    /**
     * @notice Emitted when the dailyAllowance of an existing supported token is changed by only Admin accounts
     * @param supportedToken Address of the token being added to supported token
     * @param changeDailyAllowance The new daily allowance of the supported token
     */
    event CHANGE_DAILY_ALLOWANCE(
        address indexed supportedToken,
        uint256 indexed changeDailyAllowance
    );

    /**
     * @notice Emitted when withdrawal of supportedToken only by the Admin account
     * @param ownerAddress Owner's address initiating withdrawal
     * @param withdrawalTokenAddress Address of the token that being withdrawed
     * @param withdrawalAmount Withdrawal amount of token
     */
    event WITHDRAWAL_BY_OWNER(
        address ownerAddress,
        address withdrawalTokenAddress,
        uint256 withdrawalAmount
    );

    /**
     * @notice Emitted when relayer address changes by only Admin accounts
     * @param oldAddress Old relayer's address
     * @param newAddress New relayer's address
     */
    event RELAYER_ADDRESS_CHANGED(
        address indexed oldAddress,
        address indexed newAddress
    );

    /**
     * @notice Emitted when transcation fee is changed by only Admin accounts
     * @param oldTxFee Old transcation fee in bps
     * @param newTxFee New transcation fee in bps
     */
    event TRANSACTION_FEE_CHANGED(uint256 oldTxFee, uint256 newTxFee);

    /**
     * @notice Emitted when withdrawal of ETHER only by the Admin account
     * @param ownerAddress Owner's address requesting withdraw
     * @param withdrawalAmount amount of respected token being withdrawn
     */
    event ETH_WITHDRAWAL_BY_OWNER(
        address ownerAddress,
        uint256 withdrawalAmount
    );

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}

    /**
     * @notice To initialize this contract (No constructor as part of the proxy pattery )
     * @param _name Name of the bridge (Need more discussion on this)
     * @param _version Version number of the contract (Need more discussion on this)
     * @param _initialAdmin Initial admin address of this contract.
     * @param _initialOperational Initial operational address of this contract.
     * @param _relayerAddress Relayer address for signature
     * @param _fee Fee charged on each transcation (initial fee: 0.3%)
     */
    function initialize(
        string memory _name,
        string memory _version,
        address _initialAdmin,
        address _initialOperational,
        address _relayerAddress,
        uint256 _fee
    ) external initializer {
        __UUPSUpgradeable_init();
        __EIP712_init(_name, _version);
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(OPERATIONAL_ROLE, _initialOperational);
        relayerAddress = _relayerAddress;
        transactionFee = _fee;
    }

    /**
     * @notice Used to claim the tokens that have been approved by the relayer (for bridging from DeFiChain to Ethereum mainnet)
     * @param _to Address to send the claimed fund
     * @param _amount Amount to be claimed
     * @param _nonce Nonce of the address making the claim
     * @param _deadline Deadline of txn. Claims must be made before the deadline.
     * @param _tokenAddress Token address of the supported token
     * @param signature Signature provided by the server
     */
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
        emit CLAIM_FUND(_tokenAddress, _to, _amount);
        eoaAddressToNonce[_to]++;
    }

    /**
     * @notice Used to transfer the supported token from Mainnet(EVM) to DefiChain
     * Transfer will only be possible if not in change allowance peroid.
     * @param _defiAddress DefiChain token address
     * @param _tokenAddress Supported token address that being bridged
     * @param _amount Amount to be bridged, this in in Wei
     */
    function bridgeToDeFiChain(
        bytes memory _defiAddress,
        address _tokenAddress,
        uint256 _amount
    ) public payable notInChangeAllowancePeriod(_tokenAddress) {
        require(supportedTokens[_tokenAddress], "BC002");
        uint256 amount = checkValue(_amount, msg.value);
        if (
            tokenAllowances[_tokenAddress].prevEpoch + (1 days) >
            block.timestamp
        ) {
            tokenAllowances[_tokenAddress].currentDailyUsage += amount;
            require(
                tokenAllowances[_tokenAddress].currentDailyUsage <=
                    tokenAllowances[_tokenAddress].dailyAllowance,
                "BC004"
            );
        } else {
            tokenAllowances[_tokenAddress].prevEpoch +=
                ((block.timestamp - tokenAllowances[_tokenAddress].prevEpoch) /
                    (1 days)) *
                (1 days);
            tokenAllowances[_tokenAddress].currentDailyUsage = amount;
            require(
                tokenAllowances[_tokenAddress].currentDailyUsage <=
                    tokenAllowances[_tokenAddress].dailyAllowance,
                "BC004"
            );
        }

        if (_tokenAddress != address(0)) {
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            );
            uint256 netAmountInWei = amountAfterFees(amount);
            emit BRIDGE_TO_DEFI_CHAIN(
                _defiAddress,
                IERC20Metadata(_tokenAddress).symbol(),
                netAmountInWei,
                block.timestamp
            );
        } else {
            uint256 netAmountInWei = amountAfterFees(amount);
            emit BRIDGE_TO_DEFI_CHAIN(
                _defiAddress,
                "ETH",
                netAmountInWei,
                block.timestamp
            );
        }
    }

    /**
     * @notice Used by addresses with Admin and Operational roles to add a new supported token and daily allowance
     * @param _token The token address to be added to supported list
     * @param _dailyAllowance Daily allowance set for the token
     */
    function addSupportedTokens(address _token, uint256 _dailyAllowance)
        external
    {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        require(!supportedTokens[_token], "BC005");
        supportedTokens[_token] = true;
        tokenAllowances[_token].prevEpoch = block.timestamp;
        tokenAllowances[_token].dailyAllowance = _dailyAllowance;
        tokenAllowances[_token].currentDailyUsage = 0;
        tokenAllowances[_token].inChangeAllowancePeriod = false;
        emit ADD_SUPPORTED_TOKEN(_token, _dailyAllowance);
    }

    /**
     * @notice Used by addresses with Admin and Operational roles to remove an exisiting supported token
     * @param _token The token address to be removed from supported list
     */
    function removeSupportedTokens(address _token) external {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        require(supportedTokens[_token], "BC002");
        supportedTokens[_token] = false;
        tokenAllowances[_token].prevEpoch = 0;
        tokenAllowances[_token].dailyAllowance = 0;
        tokenAllowances[_token].currentDailyUsage = 0;
        tokenAllowances[_token].inChangeAllowancePeriod = false;
        emit REMOVE_SUPPORTED_TOKEN(_token);
    }

    /**
     * @notice Used by addresses with Admin and Operational roles to set the new daily allowance
     * for corresponding token
     * @param _tokenAddress The token address to set the allowance
     * @param _dailyAllowance Daily allowance set for the token
     */
    function changeDailyAllowance(
        address _tokenAddress,
        uint256 _dailyAllowance
    ) external notInChangeAllowancePeriod(_tokenAddress) {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        if (!supportedTokens[_tokenAddress]) revert ONLY_SUPPORTED_TOKENS();
        tokenAllowances[_tokenAddress].inChangeAllowancePeriod = true;
        tokenAllowances[_tokenAddress].dailyAllowance = _dailyAllowance;
        emit CHANGE_DAILY_ALLOWANCE(_tokenAddress, _dailyAllowance);
    }

    /**
     * @notice Used by Admin only. When called, the specified amount will be withdrawn
     * @param token The token that will be withdraw
     * @param amount Requested amount to be withdraw. Amount would be in the denomination of ETH
     */
    function withdraw(address token, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        IERC20(token).transfer(msg.sender, amount);
        emit WITHDRAWAL_BY_OWNER(msg.sender, token, amount);
    }

    /**
     * @notice Used by Admin only. When called, the specified amount of ETH will be withdrawn
     * @param amount Requested amount to be withdraw. Amount would be in the denomination of ETH
     */
    function withdrawEth(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (amount > address(this).balance) revert NOT_ENOUGH_ETHEREUM();
        payable(msg.sender).transfer(amount);
        emit ETH_WITHDRAWAL_BY_OWNER(msg.sender, amount);
    }

    /**
     * @notice Used by addresses with Admin and Operational roles to set the new _relayerAddress
     * @param _relayerAddress The new relayer address, ie. the address used by the server for signing claims
     */
    function changeRelayerAddress(address _relayerAddress) external {
        if (!checkRoles()) revert NON_AUTHORIZED_ADDRESS();
        require(_relayerAddress != address(0), "BC006");
        address oldRelayerAddress = relayerAddress;
        relayerAddress = _relayerAddress;
        emit RELAYER_ADDRESS_CHANGED(oldRelayerAddress, _relayerAddress);
    }

    /**
     * @notice Used by addresses with Admin and Operational roles to set the new txn fee
     * @param fee The new fee
     */
    function changeTxFee(uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldTxFee = transactionFee;
        transactionFee = fee;
        emit TRANSACTION_FEE_CHANGED(oldTxFee, transactionFee);
    }

    /**
     * @notice Primarily being used to check the admin roles
     * @return check true if msg.sender id one of admins, false otherwise.
     */
    function checkRoles() internal view returns (bool check) {
        return
            check =
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(OPERATIONAL_ROLE, msg.sender);
    }

    /**
     * This function will do check if passing arguments has value. Both params can be used inter-changebly
     * @param _amount Ideally will be the value of erc20 token
     * @param _value Ideally will be the value of Ether
     * @return uint256 type value that is not undefined
     */
    function checkValue(uint256 _amount, uint256 _value)
        internal
        pure
        returns (uint256)
    {
        if (_amount == 0) {
            return _value;
        } else return _amount;
    }

    /**
     * This function provides the net amount after deducting fee
     * @param _amount Ideally will be the value of erc20 token
     * @return netAmountInWei net balance after the fee amount taken
     */
    function amountAfterFees(uint256 _amount)
        private
        view
        returns (uint256 netAmountInWei)
    {
        netAmountInWei = _amount - (_amount * transactionFee) / 10000;
    }
}
