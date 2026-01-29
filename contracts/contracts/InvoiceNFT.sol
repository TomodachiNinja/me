// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InvoiceNFT
 * @dev NFT-based invoice system for supply chain financing
 * @notice Hackathon-friendly contract for tokenizing invoices
 */
contract InvoiceNFT is ERC721, Ownable {

    /// @dev Counter for token IDs
    uint256 private _nextTokenId;

    /// @dev Invoice data structure
    struct Invoice {
        bytes32 invoiceHash;
        address supplier;
        address buyer;
        uint256 amount;
        uint256 dueDate;
        bool paid;
    }

    /// @dev Mapping from token ID to Invoice data
    mapping(uint256 => Invoice) public invoices;

    /// @dev Mapping to track used invoice hashes (prevent duplicates)
    mapping(bytes32 => bool) public invoiceHashExists;

    /// @dev Events for tracking invoice lifecycle
    event InvoiceMinted(
        uint256 indexed tokenId,
        bytes32 indexed invoiceHash,
        address indexed supplier,
        address buyer,
        uint256 amount,
        uint256 dueDate
    );

    event InvoicePaid(uint256 indexed tokenId, address indexed buyer);

    /// @dev Custom errors for gas efficiency
    error DuplicateInvoiceHash(bytes32 invoiceHash);
    error OnlyBuyerCanMarkPaid(address caller, address buyer);
    error InvoiceAlreadyPaid(uint256 tokenId);
    error InvalidBuyerAddress();
    error InvalidAmount();

    constructor() ERC721("InvoiceNFT", "INVNFT") Ownable(msg.sender) {}

    /**
     * @notice Mint a new invoice NFT
     * @dev Only owner can mint. Invoice hash must be unique.
     * @param invoiceHash Unique hash identifying the invoice
     * @param buyer Address of the invoice buyer
     * @param amount Invoice amount in wei
     * @param dueDate Unix timestamp for payment due date
     * @return tokenId The ID of the newly minted invoice NFT
     */
    function mintInvoice(
        bytes32 invoiceHash,
        address buyer,
        uint256 amount,
        uint256 dueDate
    ) external onlyOwner returns (uint256) {
        // Validate inputs
        if (buyer == address(0)) revert InvalidBuyerAddress();
        if (amount == 0) revert InvalidAmount();

        // Check for duplicate invoice hash
        if (invoiceHashExists[invoiceHash]) {
            revert DuplicateInvoiceHash(invoiceHash);
        }

        // Mark invoice hash as used
        invoiceHashExists[invoiceHash] = true;

        // Get token ID and increment counter
        uint256 tokenId = _nextTokenId++;

        // Store invoice data
        invoices[tokenId] = Invoice({
            invoiceHash: invoiceHash,
            supplier: msg.sender,
            buyer: buyer,
            amount: amount,
            dueDate: dueDate,
            paid: false
        });

        // Mint NFT to the supplier (contract owner/caller)
        _mint(msg.sender, tokenId);

        emit InvoiceMinted(tokenId, invoiceHash, msg.sender, buyer, amount, dueDate);

        return tokenId;
    }

    /**
     * @notice Mark an invoice as paid
     * @dev Only the buyer of the invoice can mark it as paid
     * @param tokenId The ID of the invoice NFT to mark as paid
     */
    function markAsPaid(uint256 tokenId) external {
        Invoice storage invoice = invoices[tokenId];

        // Only the buyer can mark as paid
        if (msg.sender != invoice.buyer) {
            revert OnlyBuyerCanMarkPaid(msg.sender, invoice.buyer);
        }

        // Check if already paid
        if (invoice.paid) {
            revert InvoiceAlreadyPaid(tokenId);
        }

        // Mark as paid
        invoice.paid = true;

        emit InvoicePaid(tokenId, msg.sender);
    }

    /**
     * @notice Get invoice details by token ID
     * @param tokenId The ID of the invoice NFT
     * @return Invoice struct containing all invoice data
     */
    function getInvoice(uint256 tokenId) external view returns (Invoice memory) {
        return invoices[tokenId];
    }

    /**
     * @notice Check if an invoice is overdue
     * @param tokenId The ID of the invoice NFT
     * @return bool True if the invoice is overdue and unpaid
     */
    function isOverdue(uint256 tokenId) external view returns (bool) {
        Invoice memory invoice = invoices[tokenId];
        return !invoice.paid && block.timestamp > invoice.dueDate;
    }

    /**
     * @notice Get total number of invoices minted
     * @return uint256 Total supply of invoice NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
