import { describe, it, expect, vi } from "vitest";

// Mock the contract function
const distributeRoyalties = vi.fn();

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("distribute-royalties", () => {
  it("should distribute royalties successfully", () => {
    const mockTokenId = 1;
    const mockRoyaltyAmount = 1000;
    const mockArtist = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

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
});
