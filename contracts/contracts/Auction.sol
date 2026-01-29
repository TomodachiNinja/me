// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvoiceNFT.sol";

/**
 * @title Auction
 * @dev Reverse auction for invoice NFT financing
 * @notice Investors bid discounts - lowest bid wins the right to finance the invoice
 */
contract Auction {

    /// @dev Reference to the InvoiceNFT contract
    InvoiceNFT public immutable invoiceNFT;

    /// @dev Auction data structure
    struct AuctionData {
        address supplier;
        uint256 invoiceAmount;
        uint256 startTime;
        uint256 endTime;
        address bestBidder;
        uint256 bestBid;        // Lowest discount bid wins
        bool isActive;
        bool isFinalized;
    }

    /// @dev Mapping from tokenId to auction data
    mapping(uint256 => AuctionData) public auctions;

    /// @dev Mapping to track bidder deposits: tokenId => bidder => amount
    mapping(uint256 => mapping(address => uint256)) public deposits;

    /// @dev Events
    event AuctionStarted(
        uint256 indexed tokenId,
        address indexed supplier,
        uint256 invoiceAmount,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 bidAmount
    );

    event AuctionFinalized(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 winningBid,
        uint256 payout
    );

    event BidWithdrawn(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    /// @dev Custom errors
    error AuctionAlreadyExists(uint256 tokenId);
    error AuctionNotActive(uint256 tokenId);
    error AuctionStillActive(uint256 tokenId);
    error NotSupplier(address caller, address supplier);
    error NotTokenOwner(address caller);
    error BidTooHigh(uint256 bid, uint256 currentBest);
    error BidExceedsInvoice(uint256 bid, uint256 invoiceAmount);
    error NoBidsPlaced(uint256 tokenId);
    error InsufficientDeposit();
    error NothingToWithdraw();
    error AuctionAlreadyFinalized(uint256 tokenId);

    constructor(address _invoiceNFT) {
        invoiceNFT = InvoiceNFT(_invoiceNFT);
    }

    /**
     * @notice Start an auction for an invoice NFT
     * @dev Only the NFT owner (supplier) can start the auction
     * @param tokenId The invoice NFT token ID
     * @param duration Auction duration in seconds
     */
    function startAuction(uint256 tokenId, uint256 duration) external {
        // Verify caller owns the NFT
        if (invoiceNFT.ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner(msg.sender);
        }

        // Check no active auction exists
        if (auctions[tokenId].isActive) {
            revert AuctionAlreadyExists(tokenId);
        }

        // Get invoice details
        (,,, uint256 amount,,) = invoiceNFT.invoices(tokenId);

        // Create auction
        auctions[tokenId] = AuctionData({
            supplier: msg.sender,
            invoiceAmount: amount,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            bestBidder: address(0),
            bestBid: amount,  // Start with invoice amount (0% discount)
            isActive: true,
            isFinalized: false
        });

        emit AuctionStarted(tokenId, msg.sender, amount, block.timestamp + duration);
    }

    /**
     * @notice Place a bid on an auction
     * @dev Bid represents the amount investor will pay (lower = bigger discount for supplier)
     * @param tokenId The invoice NFT token ID
     * @param bidAmount The bid amount (must be lower than current best)
     */
    function placeBid(uint256 tokenId, uint256 bidAmount) external payable {
        AuctionData storage auction = auctions[tokenId];

        // Check auction is active
        if (!auction.isActive || block.timestamp > auction.endTime) {
            revert AuctionNotActive(tokenId);
        }

        // Bid must be lower than current best (reverse auction)
        if (bidAmount >= auction.bestBid) {
            revert BidTooHigh(bidAmount, auction.bestBid);
        }

        // Bid can't exceed invoice amount
        if (bidAmount > auction.invoiceAmount) {
            revert BidExceedsInvoice(bidAmount, auction.invoiceAmount);
        }

        // Must deposit at least the bid amount
        uint256 totalDeposit = deposits[tokenId][msg.sender] + msg.value;
        if (totalDeposit < bidAmount) {
            revert InsufficientDeposit();
        }

        // Update deposit
        deposits[tokenId][msg.sender] = totalDeposit;

        // Update best bid
        auction.bestBidder = msg.sender;
        auction.bestBid = bidAmount;

        emit BidPlaced(tokenId, msg.sender, bidAmount);
    }

    /**
     * @notice Finalize the auction and pay the supplier
     * @dev Only supplier can finalize after auction ends
     * @param tokenId The invoice NFT token ID
     */
    function finalizeAuction(uint256 tokenId) external {
        AuctionData storage auction = auctions[tokenId];

        // Only supplier can finalize
        if (msg.sender != auction.supplier) {
            revert NotSupplier(msg.sender, auction.supplier);
        }

        // Check auction has ended
        if (block.timestamp < auction.endTime) {
            revert AuctionStillActive(tokenId);
        }

        // Check not already finalized
        if (auction.isFinalized) {
            revert AuctionAlreadyFinalized(tokenId);
        }

        // Must have at least one bid
        if (auction.bestBidder == address(0)) {
            revert NoBidsPlaced(tokenId);
        }

        // Mark as finalized
        auction.isActive = false;
        auction.isFinalized = true;

        // Deduct winning bid from winner's deposit
        uint256 winningBid = auction.bestBid;
        deposits[tokenId][auction.bestBidder] -= winningBid;

        // Pay supplier
        (bool success, ) = payable(auction.supplier).call{value: winningBid}("");
        require(success, "Transfer failed");

        emit AuctionFinalized(tokenId, auction.bestBidder, winningBid, winningBid);
    }

    /**
     * @notice Withdraw unused deposit after auction ends
     * @dev Non-winners can withdraw their full deposit
     * @param tokenId The invoice NFT token ID
     */
    function withdrawDeposit(uint256 tokenId) external {
        AuctionData storage auction = auctions[tokenId];

        // Auction must be finalized or expired without bids
        if (auction.isActive && block.timestamp <= auction.endTime) {
            revert AuctionStillActive(tokenId);
        }

        uint256 amount = deposits[tokenId][msg.sender];
        if (amount == 0) {
            revert NothingToWithdraw();
        }

        // Clear deposit
        deposits[tokenId][msg.sender] = 0;

        // Return funds
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit BidWithdrawn(tokenId, msg.sender, amount);
    }

    /**
     * @notice Get auction details
     * @param tokenId The invoice NFT token ID
     * @return AuctionData struct
     */
    function getAuction(uint256 tokenId) external view returns (AuctionData memory) {
        return auctions[tokenId];
    }

    /**
     * @notice Check if auction is still accepting bids
     * @param tokenId The invoice NFT token ID
     * @return bool True if auction is active and not expired
     */
    function isAuctionActive(uint256 tokenId) external view returns (bool) {
        AuctionData memory auction = auctions[tokenId];
        return auction.isActive && block.timestamp <= auction.endTime;
    }

    /**
     * @notice Calculate discount percentage for a bid
     * @param tokenId The invoice NFT token ID
     * @param bidAmount The bid amount
     * @return discount Discount percentage (basis points, 10000 = 100%)
     */
    function calculateDiscount(uint256 tokenId, uint256 bidAmount) external view returns (uint256) {
        uint256 invoiceAmount = auctions[tokenId].invoiceAmount;
        if (invoiceAmount == 0) return 0;
        return ((invoiceAmount - bidAmount) * 10000) / invoiceAmount;
    }
}
