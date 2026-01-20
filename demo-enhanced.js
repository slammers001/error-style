import { prettyError, setupGlobalErrorHandlers, getErrorCount } from './dist/index.js';

console.log('🚀 Enhanced error-style demo\n');

// Set up global error handlers
setupGlobalErrorHandlers({
  framework: 'react',
  environment: 'browser'
});

// Test 1: Undefined property error
console.log('--- Test 1: Undefined property ---');
try {
  const users = undefined;
  users.map(u => u.name);
} catch (error) {
  console.log(prettyError(error));
}

// Test 2: JSON parsing error
console.log('\n--- Test 2: JSON parsing error ---');
try {
  JSON.parse('<html>Error page</html>');
} catch (error) {
  console.log(prettyError(error));
}

// Test 3: Map not a function
console.log('\n--- Test 3: Map not a function ---');
try {
  const data = 'not an array';
  data.map(item => item);
} catch (error) {
  console.log(prettyError(error));
}

// Test 4: React-style error
console.log('\n--- Test 4: React error ---');
try {
  throw new Error('Objects are not valid as a React child');
} catch (error) {
  console.log(prettyError(error, { framework: 'react' }));
}

// Test 5: Unknown error
console.log('\n--- Test 5: Unknown error ---');
try {
  throw new Error('Some completely random error message');
} catch (error) {
  console.log(prettyError(error));
}

console.log('\n✅ Enhanced demo complete!');
console.log(`📈 Total errors processed: ${getErrorCount()}`);
