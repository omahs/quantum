import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract GoerliTestToken is ERC20, AccessControl {
    constructor(
        string memory a,
        string memory b,
        address tokenAdminAddress
    ) ERC20(a, b) {
        _grantRole(DEFAULT_ADMIN_ROLE, tokenAdminAddress);
    }

    function mint(address _to, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(_to, _amount);
    }
}
