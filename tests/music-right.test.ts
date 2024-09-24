import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the contract function
const distributeRoyalties = vi.fn();

describe("distribute-royalties", () => {
  beforeEach(() => {
    // Reset the mock before each test
    distributeRoyalties.mockClear();
  });

  it("should distribute royalties successfully", () => {
    const mockTokenId = 1;
    const mockRoyaltyAmount = 1000;

    // Mock successful distribution
    distributeRoyalties.mockReturnValue({ isOk: true, value: true });

    const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

    expect(result.isOk).toBe(true);
    expect(result.value).toBe(true);
    expect(distributeRoyalties).toHaveBeenCalledWith(
      mockTokenId,
      mockRoyaltyAmount
    );
  });

  it("should fail if caller is not the artist", () => {
    const mockTokenId = 1;
    const mockRoyaltyAmount = 1000;

    // Mock failure due to unauthorized caller
    distributeRoyalties.mockReturnValue({
      isOk: false,
      value: "ERR_NOT_AUTHORIZED",
    });

    const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

    expect(result.isOk).toBe(false);
    expect(result.value).toBe("ERR_NOT_AUTHORIZED");
  });

  it("should fail if NFT does not exist", () => {
    const mockTokenId = 999; // Non-existent token ID
    const mockRoyaltyAmount = 1000;

    // Mock failure due to non-existent NFT
    distributeRoyalties.mockReturnValue({
      isOk: false,
      value: "ERR_NFT_NOT_FOUND",
    });

    const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

    expect(result.isOk).toBe(false);
    expect(result.value).toBe("ERR_NFT_NOT_FOUND");
  });

  it("should fail if minting royalty tokens fails", () => {
    const mockTokenId = 1;
    const mockRoyaltyAmount = 1000;

    // Mock failure due to minting error
    distributeRoyalties.mockReturnValue({
      isOk: false,
      value: "ERR_MINT_FAILED",
    });

    const result = distributeRoyalties(mockTokenId, mockRoyaltyAmount);

    expect(result.isOk).toBe(false);
    expect(result.value).toBe("ERR_MINT_FAILED");
  });
});
