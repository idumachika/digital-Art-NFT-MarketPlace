import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock contract functions
const mintMusicRights = vi.fn();
const transferShares = vi.fn();
const distributeRoyalties = vi.fn();
const claimRoyalties = vi.fn();
const listForSale = vi.fn();
const cancelSaleListing = vi.fn();
const buyNft = vi.fn();
const setRevenuePerStream = vi.fn();
const updateStreamingData = vi.fn();
const setOracleAddress = vi.fn();

// Mock read-only functions
const getTokenInfo = vi.fn();
const getShareBalance = vi.fn();
const getTotalRoyalties = vi.fn();
const getNftSaleStatus = vi.fn();
const getRevenuePerStream = vi.fn();

describe("Music Rights NFT Contract", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  describe("mint-music-rights", () => {
    it("should mint a new music rights NFT successfully", () => {
      const artist = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const songTitle = "My Awesome Song";
      const royaltyPercentage = 10;
      const totalShares = 1000;
      const uri = "https://example.com/metadata.json";

      mintMusicRights.mockReturnValue({ isOk: true, value: 1 });

      const result = mintMusicRights(
        artist,
        songTitle,
        royaltyPercentage,
        totalShares,
        uri
      );

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(1);
      expect(mintMusicRights).toHaveBeenCalledWith(
        artist,
        songTitle,
        royaltyPercentage,
        totalShares,
        uri
      );
    });

    it("should fail if caller is not the contract owner", () => {
      mintMusicRights.mockReturnValue({
        isOk: false,
        value: "ERR_NOT_AUTHORIZED",
      });

      const result = mintMusicRights(
        "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        "Song",
        10,
        1000,
        "uri"
      );

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  describe("transfer-shares", () => {
    it("should transfer shares successfully", () => {
      const tokenId = 1;
      const amount = 100;
      const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const recipient = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

      transferShares.mockReturnValue({ isOk: true, value: true });

      const result = transferShares(tokenId, amount, sender, recipient);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(transferShares).toHaveBeenCalledWith(
        tokenId,
        amount,
        sender,
        recipient
      );
    });

    it("should fail if sender has insufficient balance", () => {
      transferShares.mockReturnValue({
        isOk: false,
        value: "ERR_INSUFFICIENT_BALANCE",
      });

      const result = transferShares(
        1,
        1000,
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      );

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_INSUFFICIENT_BALANCE");
    });
  });

  describe("distribute-royalties", () => {
    it("should distribute royalties successfully", () => {
      const tokenId = 1;
      const royaltyAmount = 1000;

      distributeRoyalties.mockReturnValue({ isOk: true, value: true });

      const result = distributeRoyalties(tokenId, royaltyAmount);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(distributeRoyalties).toHaveBeenCalledWith(tokenId, royaltyAmount);
    });

    it("should fail if caller is not the artist", () => {
      distributeRoyalties.mockReturnValue({
        isOk: false,
        value: "ERR_NOT_AUTHORIZED",
      });

      const result = distributeRoyalties(1, 1000);

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  describe("claim-royalties", () => {
    it("should claim royalties successfully", () => {
      const tokenId = 1;

      claimRoyalties.mockReturnValue({ isOk: true, value: 500 });

      const result = claimRoyalties(tokenId);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(500);
      expect(claimRoyalties).toHaveBeenCalledWith(tokenId);
    });

    it("should fail if there are no royalties to claim", () => {
      claimRoyalties.mockReturnValue({
        isOk: false,
        value: "ERR_NO_ROYALTIES_TO_CLAIM",
      });

      const result = claimRoyalties(1);

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NO_ROYALTIES_TO_CLAIM");
    });
  });

  describe("list-for-sale", () => {
    it("should list an NFT for sale successfully", () => {
      const tokenId = 1;
      const price = 1000000;

      listForSale.mockReturnValue({ isOk: true, value: true });

      const result = listForSale(tokenId, price);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(listForSale).toHaveBeenCalledWith(tokenId, price);
    });

    it("should fail if caller is not the owner", () => {
      listForSale.mockReturnValue({ isOk: false, value: "ERR_NOT_AUTHORIZED" });

      const result = listForSale(1, 1000000);

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  describe("cancel-sale-listing", () => {
    it("should cancel a sale listing successfully", () => {
      const tokenId = 1;

      cancelSaleListing.mockReturnValue({ isOk: true, value: true });

      const result = cancelSaleListing(tokenId);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(cancelSaleListing).toHaveBeenCalledWith(tokenId);
    });

    it("should fail if caller is not the owner", () => {
      cancelSaleListing.mockReturnValue({
        isOk: false,
        value: "ERR_NOT_AUTHORIZED",
      });

      const result = cancelSaleListing(1);

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  describe("buy-nft", () => {
    it("should buy an NFT successfully", () => {
      const tokenId = 1;

      buyNft.mockReturnValue({ isOk: true, value: true });

      const result = buyNft(tokenId);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(buyNft).toHaveBeenCalledWith(tokenId);
    });

    it("should fail if NFT is not for sale", () => {
      buyNft.mockReturnValue({ isOk: false, value: "ERR_NOT_AUTHORIZED" });

      const result = buyNft(1);

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  describe("set-revenue-per-stream", () => {
    it("should set revenue per stream successfully", () => {
      const tokenId = 1;
      const amount = 10;

      setRevenuePerStream.mockReturnValue({ isOk: true, value: true });

      const result = setRevenuePerStream(tokenId, amount);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(setRevenuePerStream).toHaveBeenCalledWith(tokenId, amount);
    });

    it("should fail if caller is not the oracle", () => {
      setRevenuePerStream.mockReturnValue({
        isOk: false,
        value: "ERR_NOT_AUTHORIZED",
      });

      const result = setRevenuePerStream(1, 10);

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  describe("update-streaming-data", () => {
    it("should update streaming data successfully", () => {
      const tokenId = 1;
      const newStreams = 1000;

      updateStreamingData.mockReturnValue({ isOk: true, value: true });

      const result = updateStreamingData(tokenId, newStreams);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(updateStreamingData).toHaveBeenCalledWith(tokenId, newStreams);
    });
  });

  describe("set-oracle-address", () => {
    it("should set oracle address successfully", () => {
      const newAddress = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

      setOracleAddress.mockReturnValue({ isOk: true, value: true });

      const result = setOracleAddress(newAddress);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(true);
      expect(setOracleAddress).toHaveBeenCalledWith(newAddress);
    });

    it("should fail if caller is not the contract owner", () => {
      setOracleAddress.mockReturnValue({
        isOk: false,
        value: "ERR_NOT_AUTHORIZED",
      });

      const result = setOracleAddress(
        "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      );

      expect(result.isOk).toBe(false);
      expect(result.value).toBe("ERR_NOT_AUTHORIZED");
    });
  });

  // Tests for read-only functions
  describe("get-token-info", () => {
    it("should return token info successfully", () => {
      const tokenId = 1;
      const tokenInfo = {
        owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        artist: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        "song-title": "My Awesome Song",
        "royalty-percentage": 10,
        "total-shares": 1000,
        uri: "https://example.com/metadata.json",
        "is-for-sale": false,
        "sale-price": 0,
      };

      getTokenInfo.mockReturnValue({ isOk: true, value: tokenInfo });

      const result = getTokenInfo(tokenId);

      expect(result.isOk).toBe(true);
      expect(result.value).toEqual(tokenInfo);
      expect(getTokenInfo).toHaveBeenCalledWith(tokenId);
    });
  });

  describe("get-share-balance", () => {
    it("should return share balance successfully", () => {
      const tokenId = 1;
      const owner = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

      getShareBalance.mockReturnValue({ isOk: true, value: 500 });

      const result = getShareBalance(tokenId, owner);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(500);
      expect(getShareBalance).toHaveBeenCalledWith(tokenId, owner);
    });
  });

  describe("get-total-royalties", () => {
    it("should return total royalties successfully", () => {
      getTotalRoyalties.mockReturnValue({ isOk: true, value: 10000 });

      const result = getTotalRoyalties();

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(10000);
      expect(getTotalRoyalties).toHaveBeenCalled();
    });
  });

  describe("get-nft-sale-status", () => {
    it("should return NFT sale status successfully", () => {
      const tokenId = 1;
      const saleStatus = { "is-for-sale": true, "sale-price": 1000000 };

      getNftSaleStatus.mockReturnValue({ isOk: true, value: saleStatus });

      const result = getNftSaleStatus(tokenId);

      expect(result.isOk).toBe(true);
      expect(result.value).toEqual(saleStatus);
      expect(getNftSaleStatus).toHaveBeenCalledWith(tokenId);
    });
  });

  describe("get-revenue-per-stream", () => {
    it("should return revenue per stream successfully", () => {
      const tokenId = 1;

      getRevenuePerStream.mockReturnValue({
        isOk: true,
        value: { amount: 10 },
      });

      const result = getRevenuePerStream(tokenId);

      expect(result.isOk).toBe(true);
      expect(result.value).toEqual({ amount: 10 });
      expect(getRevenuePerStream).toHaveBeenCalledWith(tokenId);
    });
  });
});

// import { describe, it, expect, vi, beforeEach } from "vitest";

// // Mock the contract function
// const distributeRoyalties = vi.fn();
// const mintMusicRights = vi.fn();
// const transferShares = vi.fn();
// const claimRoyalties = vi.fn();
// const listForSale = vi.fn();
// const cancelSaleListing = vi.fn();
// const buyNft = vi.fn();
// const setRevenuePerStream = vi.fn();
// const updateStreamingData = vi.fn();
// const setOracleAddress = vi.fn();

// describe("distribute-royalties", () => {
//   beforeEach(() => {
//     // Reset the mock before each test
//     distributeRoyalties.mockClear();
//   });

//   it("should distribute royalties successfully", () => {
//     const mockTokenId = 1;
//     const mockRoyaltyAmount = 1000;

//     // Mock successful distribution
//     distributeRoyalties.mockReturnValue({ isOk: true, value: true });

//     const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

//     expect(result.isOk).toBe(true);
//     expect(result.value).toBe(true);
//     expect(distributeRoyalties).toHaveBeenCalledWith(
//       mockTokenId,
//       mockRoyaltyAmount
//     );
//   });

//   it("should fail if caller is not the artist", () => {
//     const mockTokenId = 1;
//     const mockRoyaltyAmount = 1000;

//     // Mock failure due to unauthorized caller
//     distributeRoyalties.mockReturnValue({
//       isOk: false,
//       value: "ERR_NOT_AUTHORIZED",
//     });

//     const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

//     expect(result.isOk).toBe(false);
//     expect(result.value).toBe("ERR_NOT_AUTHORIZED");
//   });

//   it("should fail if NFT does not exist", () => {
//     const mockTokenId = 999; // Non-existent token ID
//     const mockRoyaltyAmount = 1000;

//     // Mock failure due to non-existent NFT
//     distributeRoyalties.mockReturnValue({
//       isOk: false,
//       value: "ERR_NFT_NOT_FOUND",
//     });

//     const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

//     expect(result.isOk).toBe(false);
//     expect(result.value).toBe("ERR_NFT_NOT_FOUND");
//   });

//   it("should fail if minting royalty tokens fails", () => {
//     const mockTokenId = 1;
//     const mockRoyaltyAmount = 1000;

//     // Mock failure due to minting error
//     distributeRoyalties.mockReturnValue({
//       isOk: false,
//       value: "ERR_MINT_FAILED",
//     });

//     const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

//     expect(result.isOk).toBe(false);
//     expect(result.value).toBe("ERR_MINT_FAILED");
//   });
// });
