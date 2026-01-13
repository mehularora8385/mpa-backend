const authService = require("../../src/services/authService");

describe("Auth Service", () => {
  it("should login a user", async () => {
    // Mock db query
    const result = await authService.login("testuser", "password", "deviceId");
    expect(result).toHaveProperty("token");
  });

  it("should not login with invalid credentials", async () => {
    await expect(authService.login("testuser", "wrongpassword", "deviceId")).rejects.toThrow("Invalid credentials");
  });
});
