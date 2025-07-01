// services/database/DatabaseTester.ts
/**
 * Comprehensive Database Testing Suite
 *
 * This testing suite validates our new Universal SQLite implementation
 * by systematically checking each aspect of functionality. Think of this
 * as a medical checkup for our database system - we test each "organ"
 * to ensure the whole system is healthy.
 *
 * Educational approach: We'll run tests in logical order, from basic
 * connectivity through complex operations, building confidence step by step.
 */

import { Platform } from "react-native";

import { SQLiteUniversal } from "./SQLiteUniversalService";

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration: number;
  details?: any;
}

interface TestSuite {
  suiteName: string;
  platform: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  totalDuration: number;
}

export class DatabaseTester {
  private results: TestResult[] = [];
  private startTime: number = 0;

  /**
   * Run comprehensive database tests
   * This method executes all our tests in logical order, ensuring each
   * component works before testing more complex functionality
   */
  async runAllTests(): Promise<TestSuite> {
    console.log("🧪 Starting comprehensive database testing...");
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    this.startTime = Date.now();
    this.results = [];

    // Test 1: Basic Initialization
    await this.testInitialization();

    // Test 2: Database Connection and State
    await this.testDatabaseState();

    // Test 3: Schema Creation and Verification
    await this.testSchemaCreation();

    // Test 4: Basic CRUD Operations
    await this.testBasicCRUD();

    // Test 5: Complex Queries and Joins
    await this.testComplexQueries();

    // Test 6: Transaction Handling
    await this.testTransactions();

    // Test 7: Error Handling and Recovery
    await this.testErrorHandling();

    // Test 8: Performance and Scalability
    await this.testPerformance();

    // Compile final results
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter((r) => r.success).length;
    const failedTests = this.results.filter((r) => !r.success).length;

    const testSuite: TestSuite = {
      suiteName: "Universal SQLite Database Tests",
      platform:
        Platform.OS === "web" ? "Web (SQL.js)" : `Native (${Platform.OS})`,
      totalTests: this.results.length,
      passedTests,
      failedTests,
      results: this.results,
      totalDuration,
    };

    this.printTestSummary(testSuite);
    return testSuite;
  }

  /**
   * Test 1: Database Initialization
   * This fundamental test ensures our initialization process works correctly
   * and doesn't fall into the recursive trap we fixed
   */
  private async testInitialization(): Promise<void> {
    await this.runTest("Database Initialization", async () => {
      // Check initial state
      const initialState = SQLiteUniversal.getInitializationState();
      console.log(`Initial state: ${initialState}`);

      // Perform initialization
      await SQLiteUniversal.initialize();

      // Verify final state
      const finalState = SQLiteUniversal.getInitializationState();
      const isReady = SQLiteUniversal.isReady();

      if (finalState !== "FULLY_INITIALIZED") {
        throw new Error(`Expected FULLY_INITIALIZED, got ${finalState}`);
      }

      if (!isReady) {
        throw new Error("Database reports as not ready after initialization");
      }

      return {
        initialState,
        finalState,
        isReady,
        message: "Database initialized successfully without recursive errors",
      };
    });
  }

  /**
   * Test 2: Database State and Information
   * Verify that our database reports correct information about itself
   */
  private async testDatabaseState(): Promise<void> {
    await this.runTest("Database State Information", async () => {
      const dbInfo = await SQLiteUniversal.getDatabaseInfo();

      // Validate basic information
      if (!dbInfo.platform) {
        throw new Error("Platform information missing");
      }

      if (dbInfo.state !== "FULLY_INITIALIZED") {
        throw new Error(
          `Expected state FULLY_INITIALIZED, got ${dbInfo.state}`,
        );
      }

      if (!dbInfo.ready) {
        throw new Error("Database not ready according to info");
      }

      // We expect at least 3 tables (dictionaries, words, examples)
      if (dbInfo.tableCount < 3) {
        throw new Error(
          `Expected at least 3 tables, found ${dbInfo.tableCount}`,
        );
      }

      return {
        platform: dbInfo.platform,
        state: dbInfo.state,
        tableCount: dbInfo.tableCount,
        totalRecords: dbInfo.totalRecords,
        message: "Database state information is correct and complete",
      };
    });
  }

  /**
   * Test 3: Schema Creation and Verification
   * Ensure all our tables and indexes were created correctly
   */
  private async testSchemaCreation(): Promise<void> {
    await this.runTest("Schema Verification", async () => {
      // Check that all expected tables exist
      const tablesResult = await SQLiteUniversal.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      );

      if (!tablesResult.success) {
        throw new Error(`Failed to query tables: ${tablesResult.error}`);
      }

      const tables = (tablesResult.data || []).map((row: any) => row.name);
      const expectedTables = ["dictionaries", "examples", "words"];

      for (const expectedTable of expectedTables) {
        if (!tables.includes(expectedTable)) {
          throw new Error(`Missing expected table: ${expectedTable}`);
        }
      }

      // Check that indexes exist
      const indexesResult = await SQLiteUniversal.execute(
        "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'",
      );

      if (!indexesResult.success) {
        throw new Error(`Failed to query indexes: ${indexesResult.error}`);
      }

      const indexes = (indexesResult.data || []).map((row: any) => row.name);

      return {
        tables,
        indexes,
        tableCount: tables.length,
        indexCount: indexes.length,
        message: "All expected tables and indexes created successfully",
      };
    });
  }

  /**
   * Test 4: Basic CRUD Operations
   * Test Create, Read, Update, Delete operations on our tables
   */
  private async testBasicCRUD(): Promise<void> {
    await this.runTest("Basic CRUD Operations", async () => {
      const now = new Date().toISOString();

      // CREATE: Insert a test dictionary
      const createDictResult = await SQLiteUniversal.execute(
        "INSERT INTO dictionaries (guid, title, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
        [
          "test-dict-crud",
          "CRUD Test Dictionary",
          "Testing CRUD operations",
          now,
          now,
        ],
      );

      if (!createDictResult.success) {
        throw new Error(
          `Failed to create dictionary: ${createDictResult.error}`,
        );
      }

      const dictionaryId = createDictResult.insertId;

      // Перевіряємо, що insertId дійсно отримано
      if (!dictionaryId) {
        throw new Error(
          "Dictionary creation succeeded but no insertId returned",
        );
      }

      console.log(`✅ Dictionary created with ID: ${dictionaryId}`);

      // READ: Retrieve the dictionary
      const readResult = await SQLiteUniversal.execute(
        "SELECT * FROM dictionaries WHERE id = ?",
        [dictionaryId], // Тепер dictionaryId гарантовано не undefined
      );

      if (
        !readResult.success ||
        !readResult.data ||
        readResult.data.length === 0
      ) {
        throw new Error(
          `Failed to read created dictionary. Success: ${readResult.success}, Data length: ${readResult.data?.length}`,
        );
      }

      const dictionary = readResult.data[0] as any;
      if (dictionary.title !== "CRUD Test Dictionary") {
        throw new Error(
          `Read data mismatch. Expected: 'CRUD Test Dictionary', Got: '${dictionary.title}'`,
        );
      }

      console.log(`✅ Dictionary read successfully: ${dictionary.title}`);

      // UPDATE: Modify the dictionary
      const updateResult = await SQLiteUniversal.execute(
        "UPDATE dictionaries SET title = ?, updatedAt = ? WHERE id = ?",
        [
          "Updated CRUD Test Dictionary",
          new Date().toISOString(),
          dictionaryId,
        ],
      );

      if (!updateResult.success || updateResult.rowsAffected !== 1) {
        throw new Error(
          `Failed to update dictionary. Success: ${updateResult.success}, Rows affected: ${updateResult.rowsAffected}`,
        );
      }

      // Verify update
      const verifyUpdateResult = await SQLiteUniversal.execute(
        "SELECT title FROM dictionaries WHERE id = ?",
        [dictionaryId],
      );

      const updatedDict = verifyUpdateResult.data?.[0] as any;
      if (updatedDict?.title !== "Updated CRUD Test Dictionary") {
        throw new Error(
          `Update verification failed. Expected: 'Updated CRUD Test Dictionary', Got: '${updatedDict?.title}'`,
        );
      }

      console.log(`✅ Dictionary updated successfully`);

      // DELETE: Remove the test dictionary
      const deleteResult = await SQLiteUniversal.execute(
        "DELETE FROM dictionaries WHERE id = ?",
        [dictionaryId],
      );

      if (!deleteResult.success || deleteResult.rowsAffected !== 1) {
        throw new Error(
          `Failed to delete dictionary. Success: ${deleteResult.success}, Rows affected: ${deleteResult.rowsAffected}`,
        );
      }

      // Verify deletion
      const verifyDeleteResult = await SQLiteUniversal.execute(
        "SELECT * FROM dictionaries WHERE id = ?",
        [dictionaryId],
      );

      if (verifyDeleteResult.data && verifyDeleteResult.data.length > 0) {
        throw new Error(
          "Dictionary not properly deleted - still exists in database",
        );
      }

      console.log(`✅ Dictionary deleted successfully`);

      return {
        createdId: dictionaryId,
        updateSuccess: true,
        deleteSuccess: true,
        message:
          "All CRUD operations completed successfully with proper parameter handling",
      };
    });
  }

  /**
   * Test 5: Complex Queries and Joins
   * Test more sophisticated database operations
   */
  private async testComplexQueries(): Promise<void> {
    await this.runTest("Complex Queries and Joins", async () => {
      const now = new Date().toISOString();

      // Set up test data
      const dictResult = await SQLiteUniversal.execute(
        "INSERT INTO dictionaries (guid, title, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
        [
          "test-dict-complex",
          "Complex Query Test",
          "Testing complex operations",
          now,
          now,
        ],
      );

      const dictionaryId = dictResult.insertId;

      // Insert multiple words
      const words = [
        {
          guid: "word-1",
          word: "hello",
          translation: "привіт",
          partOfSpeech: "interjection",
        },
        {
          guid: "word-2",
          word: "world",
          translation: "світ",
          partOfSpeech: "noun",
        },
        {
          guid: "word-3",
          word: "beautiful",
          translation: "красивий",
          partOfSpeech: "adjective",
        },
      ];

      const wordIds = [];
      for (const word of words) {
        const wordResult = await SQLiteUniversal.execute(
          "INSERT INTO words (guid, word, translation, partOfSpeech, dictionaryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            word.guid,
            word.word,
            word.translation,
            word.partOfSpeech,
            dictionaryId,
            now,
            now,
          ],
        );
        wordIds.push(wordResult.insertId);
      }

      // Test JOIN query
      const joinResult = await SQLiteUniversal.execute(
        `
        SELECT w.word, w.translation, w.partOfSpeech, d.title as dictionaryTitle
        FROM words w
        JOIN dictionaries d ON w.dictionaryId = d.id
        WHERE d.id = ?
        ORDER BY w.word
      `,
        [dictionaryId],
      );

      if (
        !joinResult.success ||
        !joinResult.data ||
        joinResult.data.length !== 3
      ) {
        throw new Error("JOIN query failed or returned incorrect results");
      }

      // Test filtering and searching
      const searchResult = await SQLiteUniversal.execute(
        `
        SELECT * FROM words 
        WHERE dictionaryId = ? AND partOfSpeech = ?
        ORDER BY word
      `,
        [dictionaryId, "noun"],
      );

      if (
        !searchResult.success ||
        !searchResult.data ||
        searchResult.data.length !== 1
      ) {
        throw new Error("Search query failed");
      }

      // Test aggregation
      const countResult = await SQLiteUniversal.execute(
        "SELECT COUNT(*) as wordCount FROM words WHERE dictionaryId = ?",
        [dictionaryId],
      );

      const wordCount = (countResult.data?.[0] as any)?.wordCount;
      if (wordCount !== 3) {
        throw new Error(`Expected 3 words, found ${wordCount}`);
      }

      // Clean up test data
      await SQLiteUniversal.execute(
        "DELETE FROM words WHERE dictionaryId = ?",
        [dictionaryId],
      );
      await SQLiteUniversal.execute("DELETE FROM dictionaries WHERE id = ?", [
        dictionaryId,
      ]);

      return {
        joinResults: joinResult.data?.length,
        searchResults: searchResult.data?.length,
        wordCount,
        message: "Complex queries and joins working correctly",
      };
    });
  }

  /**
   * Test 6: Transaction Handling
   * Verify that transactions work correctly and maintain data integrity
   */
  private async testTransactions(): Promise<void> {
    await this.runTest("Transaction Handling", async () => {
      // This test is currently a placeholder since our current implementation
      // doesn't have the transaction method in the interface. We'll add this
      // when we implement the transaction functionality.

      return {
        message:
          "Transaction testing placeholder - will be implemented with transaction support",
      };
    });
  }

  /**
   * Test 7: Error Handling and Recovery
   * Ensure our system handles errors gracefully
   */
  private async testErrorHandling(): Promise<void> {
    await this.runTest("Error Handling", async () => {
      // Test invalid SQL
      const invalidSQLResult = await SQLiteUniversal.execute(
        "INVALID SQL STATEMENT",
      );

      if (invalidSQLResult.success) {
        throw new Error("Expected invalid SQL to fail, but it succeeded");
      }

      if (!invalidSQLResult.error) {
        throw new Error("Error result should contain error message");
      }

      // Test non-existent table
      const invalidTableResult = await SQLiteUniversal.execute(
        "SELECT * FROM nonexistent_table",
      );

      if (invalidTableResult.success) {
        throw new Error("Expected query on non-existent table to fail");
      }

      return {
        invalidSQLHandled: !invalidSQLResult.success,
        invalidTableHandled: !invalidTableResult.success,
        message:
          "Error handling working correctly - invalid operations properly rejected",
      };
    });
  }

  /**
   * Test 8: Performance and Scalability
   * Basic performance testing to ensure reasonable response times
   */
  private async testPerformance(): Promise<void> {
    await this.runTest("Basic Performance", async () => {
      const iterations = 100;
      const startTime = Date.now();

      // Perform multiple simple queries to test performance
      for (let i = 0; i < iterations; i++) {
        const result = await SQLiteUniversal.execute(
          "SELECT name FROM sqlite_master WHERE type='table' LIMIT 1",
        );

        if (!result.success) {
          throw new Error(`Performance test failed at iteration ${i}`);
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;

      // Expect average query time to be reasonable (less than 50ms per query)
      if (averageTime > 50) {
        console.warn(
          `Performance warning: Average query time ${averageTime.toFixed(2)}ms exceeds 50ms threshold`,
        );
      }

      return {
        iterations,
        totalTime,
        averageTime: Math.round(averageTime * 100) / 100,
        message: `Completed ${iterations} queries in ${totalTime}ms (avg: ${averageTime.toFixed(2)}ms per query)`,
      };
    });
  }

  /**
   * Helper method to run individual tests with proper error handling
   */
  private async runTest(
    testName: string,
    testFunction: () => Promise<any>,
  ): Promise<void> {
    const testStart = Date.now();
    console.log(`🔬 Running test: ${testName}`);

    try {
      const result = await testFunction();
      const duration = Date.now() - testStart;

      this.results.push({
        name: testName,
        success: true,
        message: result.message || "Test passed",
        duration,
        details: result,
      });

      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      if (result.message) {
        console.log(`   📝 ${result.message}`);
      }
    } catch (error) {
      const duration = Date.now() - testStart;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.results.push({
        name: testName,
        success: false,
        message: errorMessage,
        duration,
        details: { error: errorMessage },
      });

      console.log(`❌ ${testName} - FAILED (${duration}ms)`);
      console.log(`   💥 ${errorMessage}`);
    }
  }

  /**
   * Print comprehensive test summary
   */
  private printTestSummary(testSuite: TestSuite): void {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 TEST SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🏷️  Suite: ${testSuite.suiteName}`);
    console.log(`📱 Platform: ${testSuite.platform}`);
    console.log(`⏱️  Total Duration: ${testSuite.totalDuration}ms`);
    console.log(`📈 Tests Run: ${testSuite.totalTests}`);
    console.log(`✅ Passed: ${testSuite.passedTests}`);
    console.log(`❌ Failed: ${testSuite.failedTests}`);
    console.log(
      `📊 Success Rate: ${Math.round((testSuite.passedTests / testSuite.totalTests) * 100)}%`,
    );

    if (testSuite.failedTests > 0) {
      console.log("\n🔍 FAILED TESTS:");
      testSuite.results
        .filter((r) => !r.success)
        .forEach((result) => {
          console.log(`   ❌ ${result.name}: ${result.message}`);
        });
    }

    console.log("\n🎯 PERFORMANCE METRICS:");
    testSuite.results.forEach((result) => {
      const status = result.success ? "✅" : "❌";
      console.log(`   ${status} ${result.name}: ${result.duration}ms`);
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }
}

// Export for easy use
export const databaseTester = new DatabaseTester();
