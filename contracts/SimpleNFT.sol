// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; // For owner NFT enumeration
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    bool public metadataFrozen;

    event MetadataFrozen();
    event BaseURIUpdated(string newBaseURI);

    constructor(
        string memory name,
        string memory symbol,
        string memory initialBaseURI,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner){
        _baseTokenURI = initialBaseURI;
    }

    // Override baseURI function from ERC721
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Allow owner to update the base URI only if metadata not frozen
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        require(!metadataFrozen, "Metadata has been frozen and cannot be changed");
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    // Freeze metadata updates forever
    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
        emit MetadataFrozen();
    }

    // Mint a new NFT token to address "to"
    function safeMint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    // Return list of token IDs owned by address "owner"
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 count = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }
}