# Dream Unlocker - Firebase Test Suite

This test suite provides comprehensive testing for the Dream Unlocker Firebase functionality, including authentication, dreams, symbols, interpretations, and end-to-end user workflows.

## Features

- **Unit Tests**: Individual service testing (auth, dreams, symbols, interpretations)
- **Integration Tests**: End-to-end user workflows and data consistency
- **Direct Firebase Testing**: Real Firebase operations with test data
- **Easy Setup**: Single command to install and run
- **Cleanup**: Automatic test data cleanup after each test

## Quick Start

1. **Install Dependencies**:
   ```bash
   cd tests
   npm install
   ```

2. **Configure Environment**:
   ```bash
   # Copy .env.example to .env and update if needed
   cp .env.example .env
   ```

3. **Run All Tests**:
   ```bash
   npm test
   ```

4. **Run Specific Test Suite**:
   ```bash
   # Auth service tests
   npm test authService

   # Dreams service tests  
   npm test dreamsService

   # Symbols service tests
   npm test symbolsService

   # Interpretations service tests
   npm test interpretationsService

   # Integration tests
   npm test end-to-end
   ```

5. **Run Tests with UI**:
   ```bash
   npm run test:ui
   ```

6. **Run Tests in Watch Mode**:
   ```bash
   npm run test:watch
   ```

## Test Structure

```
tests/
├── config/
│   └── firebase-test.mjs          # Firebase test configuration
├── services/
│   ├── authService.test.mjs       # Authentication tests
│   ├── dreamsService.test.mjs     # Dreams CRUD tests
│   ├── symbolsService.test.mjs    # Symbols query tests
│   └── interpretationsService.test.mjs # Interpretations tests
├── integration/
│   └── end-to-end.test.mjs        # Complete user workflows
├── utils/
│   └── test-helpers.mjs           # Test utilities and helpers
├── .env                           # Environment configuration
├── .env.example                   # Environment template
├── package.json                   # Dependencies and scripts
├── setup.mjs                      # Test setup and teardown
├── vitest.config.ts              # Test configuration
└── README.md                      # This file
```

## Test Coverage

### Authentication Service
- ✅ User registration with validation
- ✅ User login/logout
- ✅ Current user retrieval
- ✅ Auth state change listeners
- ✅ Password reset functionality
- ✅ Error handling for invalid credentials

### Dreams Service  
- ✅ Create dreams with symbols/emotions
- ✅ Retrieve dreams by ID and user
- ✅ Update dream fields
- ✅ Delete dreams
- ✅ Search dreams by content
- ✅ Get recent dreams with limits
- ✅ Data validation and error handling

### Symbols Service
- ✅ Get all symbols (ordered)
- ✅ Search symbols by name prefix
- ✅ Filter symbols by category
- ✅ Get most frequent symbols
- ✅ Batch get symbols by IDs
- ✅ Handle Firestore query limitations

### Interpretations Service
- ✅ Create AI-generated interpretations
- ✅ Retrieve interpretations by dream ID
- ✅ Update interpretation fields
- ✅ User reflection management
- ✅ Delete interpretations
- ✅ Get user's interpretations

### Integration Tests
- ✅ Complete user registration → dream creation → interpretation workflow
- ✅ Multiple dreams and interpretations handling
- ✅ Data consistency and referential integrity
- ✅ Concurrent operations
- ✅ Error handling and edge cases

## Environment Variables

The tests use the following environment variables (configured in `.env`):

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=dream-unlocker-mvp
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=dream-unlocker-mvp.firebaseapp.com
FIREBASE_STORAGE_BUCKET=dream-unlocker-mvp.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id  
FIREBASE_APP_ID=your-app-id

# Test User Credentials
TEST_USER_EMAIL=test@dreamunlocker.com
TEST_USER_PASSWORD=testpassword123
TEST_USER_FIRST_NAME=Test
TEST_USER_LAST_NAME=User
```

## Key Test Features

### Automatic Cleanup
- Each test automatically cleans up created data
- User accounts are deleted after tests
- Firestore documents are removed
- No manual cleanup required

### Real Firebase Operations
- Tests use actual Firebase services (not mocked)
- Validates real-world functionality
- Tests Firebase security rules
- Verifies data persistence and retrieval

### Comprehensive Error Testing
- Invalid authentication attempts
- Non-existent resource requests
- Data validation failures
- Network and permission errors

### Performance Testing
- Concurrent operation handling
- Large dataset queries
- Batch operations efficiency
- Query optimization validation

## Firebase Security Rules Testing

The tests validate Firebase security rules by:
- Ensuring users can only access their own data
- Testing authentication requirements
- Validating field-level permissions
- Checking data isolation between users

## Troubleshooting

### Common Issues

**Firebase Connection Errors**:
- Ensure `.env` file has correct Firebase configuration
- Check Firebase project permissions
- Verify internet connectivity

**Test Timeout Errors**:
- Increase timeout values in `vitest.config.ts`
- Check Firebase emulator if using local testing
- Verify Firebase project is active

**Authentication Errors**:
- Ensure Firebase Auth is enabled in console
- Check email/password provider is configured
- Verify test user credentials in `.env`

**Permission Denied Errors**:
- Review Firestore security rules
- Ensure test user has required permissions
- Check collection names and paths

### Debug Mode

Run tests with debug output:
```bash
DEBUG=true npm test
```

### Selective Test Running

Run specific test files:
```bash
npm test -- authService.test.mjs
npm test -- --grep "Create Dream"
```

## Contributing

When adding new tests:

1. Follow the existing naming convention
2. Use the test helpers from `utils/test-helpers.mjs`
3. Ensure proper cleanup in `afterEach` hooks
4. Add comprehensive error case testing
5. Update this README with new test coverage

## Performance Considerations

- Tests run against live Firebase (not emulator)
- Each test creates and cleans up real data
- Consider rate limits for large test suites
- Use `beforeAll`/`afterAll` for expensive setup when possible