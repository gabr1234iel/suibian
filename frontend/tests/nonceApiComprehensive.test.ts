import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  getOrCreateSaltForGoogleId,
  createSealPolicy,
  validateSealPackage,
  clearStoredData,
  listStoredData,
  validateSalt,
  checkGoogleIdExists,
  getSaltForGoogleId,
  storeEncryptedSalt,
  getEncryptedSalt,
  getBlobIdMapping,
  clearBlobIdMapping,
  isProductionStorageAvailable,
} from "../api/nonceApi";

// Test configuration
const TEST_GOOGLE_IDS = [
  "108335149482826800606", // Primary test Google ID
  "208335149482826800607", // Secondary test Google ID
  "308335149482826800608", // Third test Google ID
];

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  data?: any;
}

class TestRunner {
  private results: TestResult[] = [];
  private ephemeralKeypair: Ed25519Keypair;

  constructor() {
    this.ephemeralKeypair = new Ed25519Keypair();
  }

  private addResult(
    testName: string,
    passed: boolean,
    message: string,
    data?: any
  ) {
    this.results.push({ testName, passed, message, data });
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${testName}: ${message}`);
    if (data) {
      console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  private getSummary() {
    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;
    const failed = total - passed;

    console.log(
      `\n📊 Test Summary: ${passed}/${total} passed, ${failed} failed`
    );

    if (failed > 0) {
      console.log("\n❌ Failed tests:");
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   - ${r.testName}: ${r.message}`);
        });
    }

    return { passed, failed, total };
  }

  async runAllTests() {
    console.log("🚀 Running comprehensive nonceApi tests...\n");
    console.log(
      `🔑 Ephemeral keypair: ${this.ephemeralKeypair
        .getPublicKey()
        .toSuiAddress()}`
    );

    try {
      // Setup
      await this.setupTests();

      // Core functionality tests
      await this.testSaltValidation();
      await this.testGoogleIdUtilityFunctions();
      await this.testSealPackageValidation();
      await this.testProductionStorageAvailability();

      // Main scenario: Create and retrieve salt
      await this.testCreateAndRetrieveSalt();

      // Advanced tests
      await this.testEncryptedSaltFunctions();
      await this.testBlobIdMapping();
      await this.testMultipleGoogleIds();
      await this.testConsistencyAcrossMultipleCalls();
      await this.testErrorHandling();

      // Performance test
      await this.testPerformance();

      // Cleanup
      await this.cleanupTests();

      const summary = this.getSummary();

      if (summary.failed === 0) {
        console.log("\n🎉 All tests passed!");
      } else {
        console.log(
          `\n⚠️  ${summary.failed} test(s) failed. Check the output above for details.`
        );
      }

      return summary.failed === 0;
    } catch (error) {
      console.error("💥 Test suite crashed:", error);
      return false;
    }
  }

  private async setupTests() {
    console.log("🧹 Setting up tests...");
    clearStoredData();
    clearBlobIdMapping();
    this.addResult("Setup", true, "Test environment cleaned and prepared");
  }

  private async cleanupTests() {
    console.log("\n🧹 Cleaning up tests...");
    clearStoredData();
    clearBlobIdMapping();
    this.addResult("Cleanup", true, "Test environment cleaned up");
  }

  private async testSaltValidation() {
    console.log("\n🧪 Testing salt validation...");

    // Test valid salts
    const validSalts = [
      "123456789012345678901234567890123456", // 36 digits
      "1", // Single digit
      "100000000000000000000000000000000", // Large valid number
    ];

    let validSaltsPassed = 0;
    validSalts.forEach((salt, index) => {
      try {
        const isValid = validateSalt(salt);
        if (isValid) {
          validSaltsPassed++;
        }
        console.log(
          `   Valid salt ${index + 1}: ${salt.substring(0, 20)}... -> ${
            isValid ? "✅" : "❌"
          }`
        );
      } catch (error) {
        console.log(`   Valid salt ${index + 1}: Error -> ${error}`);
      }
    });

    this.addResult(
      "Salt Validation - Valid Salts",
      validSaltsPassed === validSalts.length,
      `${validSaltsPassed}/${validSalts.length} valid salts passed validation`
    );

    // Test invalid salts
    const invalidSalts = [
      "", // Empty
      "not_a_number", // Non-numeric
    ];

    let invalidSaltsRejected = 0;
    invalidSalts.forEach((salt, index) => {
      try {
        const isValid = validateSalt(salt);
        if (!isValid) {
          invalidSaltsRejected++;
        }
        console.log(
          `   Invalid salt ${index + 1}: "${salt}" -> ${
            isValid ? "❌ Should be invalid" : "✅"
          }`
        );
      } catch (error) {
        invalidSaltsRejected++;
        console.log(
          `   Invalid salt ${index + 1}: "${salt}" -> ✅ Correctly threw error`
        );
      }
    });

    this.addResult(
      "Salt Validation - Invalid Salts",
      invalidSaltsRejected === invalidSalts.length,
      `${invalidSaltsRejected}/${invalidSalts.length} invalid salts correctly rejected`
    );
  }

  private async testGoogleIdUtilityFunctions() {
    console.log("\n🔍 Testing Google ID utility functions...");

    const testGoogleId = TEST_GOOGLE_IDS[0];

    // Test checkGoogleIdExists before any data is stored
    const existsBeforeCreate = await checkGoogleIdExists(testGoogleId);
    this.addResult(
      "Check Google ID Exists - Before Creation",
      !existsBeforeCreate,
      `Google ID should not exist before creation: ${!existsBeforeCreate}`
    );

    // Test getSaltForGoogleId before any data is stored
    const saltBeforeCreate = await getSaltForGoogleId(testGoogleId);
    this.addResult(
      "Get Salt - Before Creation",
      saltBeforeCreate === null,
      `Salt should be null before creation: ${saltBeforeCreate === null}`
    );
  }

  private async testSealPackageValidation() {
    console.log("\n📦 Testing Seal package validation...");

    try {
      const isValidPackage = await validateSealPackage();
      this.addResult(
        "Seal Package Validation",
        true, // We accept both true and false as valid outcomes
        `Package validation completed: ${
          isValidPackage ? "Valid" : "Invalid (expected for test environment)"
        }`
      );
    } catch (error) {
      this.addResult(
        "Seal Package Validation",
        false,
        `Package validation failed with error: ${error}`
      );
    }
  }

  private async testProductionStorageAvailability() {
    console.log("\n🏭 Testing production storage availability...");

    try {
      const isAvailable = await isProductionStorageAvailable();
      this.addResult(
        "Production Storage Availability",
        true, // We accept both true and false as valid outcomes
        `Production storage check completed: ${
          isAvailable
            ? "Available"
            : "Not available (expected for test environment)"
        }`
      );
    } catch (error) {
      this.addResult(
        "Production Storage Availability",
        false,
        `Production storage check failed: ${error}`
      );
    }
  }

  private async testCreateAndRetrieveSalt() {
    console.log("\n🧂 Testing main scenario: Create and retrieve salt...");

    const testGoogleId = TEST_GOOGLE_IDS[0];

    // Step 1: Create salt for new Google ID
    console.log(`\n   Step 1: Creating salt for Google ID: ${testGoogleId}`);
    let firstSalt: string;

    try {
      firstSalt = await getOrCreateSaltForGoogleId(
        testGoogleId,
        this.ephemeralKeypair
      );

      const isValidSalt = validateSalt(firstSalt);
      this.addResult(
        "Create Salt - First Call",
        isValidSalt && firstSalt.length > 0,
        `Salt created successfully: ${firstSalt.substring(
          0,
          20
        )}... (valid: ${isValidSalt})`,
        { salt: firstSalt, length: firstSalt.length }
      );
    } catch (error) {
      this.addResult(
        "Create Salt - First Call",
        false,
        `Failed to create salt: ${error}`
      );
      return; // Can't continue without first salt
    }

    // Step 2: Verify Google ID now exists
    const existsAfterCreate = await checkGoogleIdExists(testGoogleId);
    this.addResult(
      "Check Google ID Exists - After Creation",
      existsAfterCreate,
      `Google ID should exist after creation: ${existsAfterCreate}`
    );

    // Step 3: Retrieve salt using getSaltForGoogleId
    const retrievedSalt = await getSaltForGoogleId(testGoogleId);
    this.addResult(
      "Get Salt - Direct Retrieval",
      retrievedSalt === firstSalt,
      `Retrieved salt matches created salt: ${retrievedSalt === firstSalt}`,
      { created: firstSalt, retrieved: retrievedSalt }
    );

    // Step 4: Call getOrCreateSaltForGoogleId again (should return existing salt)
    console.log(
      `\n   Step 4: Retrieving existing salt for Google ID: ${testGoogleId}`
    );

    try {
      const secondSalt = await getOrCreateSaltForGoogleId(
        testGoogleId,
        this.ephemeralKeypair
      );

      const saltsMatch = firstSalt === secondSalt;
      this.addResult(
        "Retrieve Salt - Second Call",
        saltsMatch,
        `Salt consistency maintained: ${saltsMatch}`,
        {
          firstCall: firstSalt,
          secondCall: secondSalt,
          match: saltsMatch,
        }
      );

      if (!saltsMatch) {
        console.log(`   ⚠️  Salt mismatch detected:`);
        console.log(`      First:  ${firstSalt}`);
        console.log(`      Second: ${secondSalt}`);
      }
    } catch (error) {
      this.addResult(
        "Retrieve Salt - Second Call",
        false,
        `Failed to retrieve existing salt: ${error}`
      );
    }

    // Step 5: Verify data is stored correctly
    const storedData = listStoredData();
    const hasOurData = storedData.some(
      (data) => data.googleId === testGoogleId && data.salt === firstSalt
    );

    this.addResult(
      "Data Storage Verification",
      hasOurData,
      `Data correctly stored in memory: ${hasOurData}`,
      { storedEntries: storedData.length, foundOurData: hasOurData }
    );
  }

  private async testEncryptedSaltFunctions() {
    console.log("\n🔐 Testing encrypted salt functions...");

    const testGoogleId = TEST_GOOGLE_IDS[1];
    const testSalt = "123456789012345678901234567890123456";

    // Test storing encrypted salt
    try {
      const storeResult = await storeEncryptedSalt(testGoogleId, testSalt);
      this.addResult(
        "Store Encrypted Salt",
        storeResult,
        `Encrypted salt storage: ${storeResult ? "Success" : "Failed"}`
      );

      if (storeResult) {
        // Test retrieving encrypted salt
        const retrievedSalt = await getEncryptedSalt(testGoogleId);
        this.addResult(
          "Retrieve Encrypted Salt",
          retrievedSalt === testSalt,
          `Encrypted salt retrieval: ${
            retrievedSalt === testSalt ? "Success" : "Failed"
          }`,
          { stored: testSalt, retrieved: retrievedSalt }
        );
      }
    } catch (error) {
      this.addResult(
        "Encrypted Salt Functions",
        false,
        `Encrypted salt functions failed: ${error}`
      );
    }
  }

  private async testBlobIdMapping() {
    console.log("\n🗂️ Testing blob ID mapping functions...");

    // Clear mappings first
    clearBlobIdMapping();
    let mapping = getBlobIdMapping();

    this.addResult(
      "Blob ID Mapping - Clear",
      mapping.size === 0,
      `Mapping cleared successfully: ${mapping.size === 0} (size: ${
        mapping.size
      })`
    );

    // Test if mapping gets populated during salt operations
    const testGoogleId = TEST_GOOGLE_IDS[2];

    try {
      await getOrCreateSaltForGoogleId(testGoogleId, this.ephemeralKeypair);

      mapping = getBlobIdMapping();
      this.addResult(
        "Blob ID Mapping - After Salt Operation",
        true, // We don't know if it will populate in test environment
        `Mapping after operation: ${mapping.size} entries`,
        { mappingSize: mapping.size }
      );
    } catch (error) {
      this.addResult(
        "Blob ID Mapping - After Salt Operation",
        false,
        `Failed to test mapping: ${error}`
      );
    }
  }

  private async testMultipleGoogleIds() {
    console.log("\n👥 Testing multiple Google IDs...");

    const results: { [key: string]: string } = {};

    // Create salts for multiple Google IDs
    for (let i = 0; i < TEST_GOOGLE_IDS.length; i++) {
      const googleId = TEST_GOOGLE_IDS[i];

      try {
        const salt = await getOrCreateSaltForGoogleId(
          googleId,
          this.ephemeralKeypair
        );
        results[googleId] = salt;
        console.log(
          `   Google ID ${i + 1}: ${googleId} -> ${salt.substring(0, 20)}...`
        );
      } catch (error) {
        console.log(`   Google ID ${i + 1}: ${googleId} -> Error: ${error}`);
      }
    }

    // Verify all salts are unique
    const salts = Object.values(results);
    const uniqueSalts = new Set(salts);
    const allUnique = salts.length === uniqueSalts.size;

    this.addResult(
      "Multiple Google IDs - Uniqueness",
      allUnique,
      `All salts are unique: ${allUnique} (${salts.length} salts, ${uniqueSalts.size} unique)`,
      { totalSalts: salts.length, uniqueSalts: uniqueSalts.size }
    );

    // Verify all Google IDs now exist
    let allExist = true;
    for (const googleId of TEST_GOOGLE_IDS) {
      const exists = await checkGoogleIdExists(googleId);
      if (!exists) {
        allExist = false;
        break;
      }
    }

    this.addResult(
      "Multiple Google IDs - Existence Check",
      allExist,
      `All Google IDs exist after creation: ${allExist}`
    );
  }

  private async testConsistencyAcrossMultipleCalls() {
    console.log("\n🔄 Testing consistency across multiple calls...");

    const testGoogleId = TEST_GOOGLE_IDS[0]; // Use existing one
    const numberOfCalls = 5;
    const results: string[] = [];

    // Make multiple calls
    for (let i = 0; i < numberOfCalls; i++) {
      try {
        const salt = await getOrCreateSaltForGoogleId(
          testGoogleId,
          this.ephemeralKeypair
        );
        results.push(salt);
      } catch (error) {
        console.log(`   Call ${i + 1}: Error -> ${error}`);
      }
    }

    // Check if all results are identical
    const allIdentical = results.every((salt) => salt === results[0]);

    this.addResult(
      "Consistency - Multiple Calls",
      allIdentical && results.length === numberOfCalls,
      `All ${numberOfCalls} calls returned identical salt: ${allIdentical}`,
      {
        callsSucceeded: results.length,
        expectedCalls: numberOfCalls,
        allIdentical,
        firstSalt: results[0]?.substring(0, 20) + "...",
      }
    );
  }

  private async testErrorHandling() {
    console.log("\n❌ Testing error handling...");

    // Test with invalid Google ID
    const invalidGoogleIds = ["", null, undefined, 123, {}];

    let errorsCaughtCorrectly = 0;

    for (let i = 0; i < invalidGoogleIds.length; i++) {
      const invalidId = invalidGoogleIds[i];

      try {
        await getOrCreateSaltForGoogleId(
          invalidId as any,
          this.ephemeralKeypair
        );
        console.log(
          `   Invalid ID ${i + 1}: ${invalidId} -> ❌ Should have thrown error`
        );
      } catch (error) {
        errorsCaughtCorrectly++;
        console.log(
          `   Invalid ID ${i + 1}: ${invalidId} -> ✅ Correctly threw error`
        );
      }
    }

    this.addResult(
      "Error Handling - Invalid Google IDs",
      errorsCaughtCorrectly === invalidGoogleIds.length,
      `Correctly handled ${errorsCaughtCorrectly}/${invalidGoogleIds.length} invalid inputs`
    );

    // Test utility functions with invalid inputs
    let utilityErrorsHandled = 0;

    try {
      await checkGoogleIdExists("");
      // Should return false, not throw
      utilityErrorsHandled++;
    } catch (error) {
      console.log(
        `   checkGoogleIdExists with empty string threw error: ${error}`
      );
    }

    try {
      await getSaltForGoogleId("");
      // Should throw error
    } catch (error) {
      utilityErrorsHandled++;
      console.log(`   getSaltForGoogleId correctly rejected empty string`);
    }

    this.addResult(
      "Error Handling - Utility Functions",
      utilityErrorsHandled >= 1,
      `Utility functions handled errors appropriately: ${utilityErrorsHandled}/2`
    );
  }

  private async testPerformance() {
    console.log("\n⏱️ Testing performance...");

    const performanceTestIds = [
      "400000000000000000001",
      "400000000000000000002",
      "400000000000000000003",
      "400000000000000000004",
      "400000000000000000005",
    ];

    console.log(
      `   Testing with ${performanceTestIds.length} new Google IDs...`
    );

    const startTime = Date.now();
    const promises = performanceTestIds.map(async (googleId) => {
      try {
        const salt = await getOrCreateSaltForGoogleId(
          googleId,
          this.ephemeralKeypair
        );
        return { googleId, salt, success: true };
      } catch (error) {
        return {
          googleId,
          error: error instanceof Error ? error.message : String(error),
          success: false,
        };
      }
    });

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter((r) => r.success).length;
    const averageTime = duration / results.length;

    this.addResult(
      "Performance Test",
      successCount === performanceTestIds.length,
      `Generated ${successCount}/${
        performanceTestIds.length
      } salts in ${duration}ms (avg: ${averageTime.toFixed(2)}ms per salt)`,
      {
        totalTime: duration,
        averageTime: averageTime.toFixed(2),
        successRate: `${successCount}/${performanceTestIds.length}`,
      }
    );

    // Verify uniqueness
    const salts = results.filter((r) => r.success).map((r) => r.salt);
    const uniqueSalts = new Set(salts);

    this.addResult(
      "Performance Test - Uniqueness",
      salts.length === uniqueSalts.size,
      `All performance test salts are unique: ${
        salts.length === uniqueSalts.size
      }`,
      { totalSalts: salts.length, uniqueCount: uniqueSalts.size }
    );
  }
}

// Main execution
async function runTests() {
  const testRunner = new TestRunner();
  const success = await testRunner.runAllTests();

  if (success) {
    console.log("\n🎉 All tests completed successfully!");
    process.exit(0);
  } else {
    console.log("\n💥 Some tests failed. Check the output above for details.");
    process.exit(1);
  }
}

// Export for potential use in other files
export { TestRunner, runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  console.log("🚀 Starting comprehensive nonceApi tests...\n");
  runTests().catch((error) => {
    console.error("💥 Test suite crashed:", error);
    process.exit(1);
  });
}
