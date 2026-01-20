import { ErrorRule } from './types.js';

export const coreRules: ErrorRule[] = [
  // === JAVASCRIPT CORE ERRORS ===
  {
    id: 'undefined-property',
    name: 'Undefined Property Access',
    category: 'javascript',
    match: (error) => 
      error.message.includes('Cannot read properties of undefined') ||
      error.message.includes('Cannot access property') && error.message.includes('undefined'),
    
    title: 'Trying to use something that doesn\'t exist',
    explanation: 'You attempted to access a property on a variable that is undefined. This usually happens when data hasn\'t loaded yet or a function returned undefined unexpectedly.',
    
    fixes: [
      'Check if the variable exists before using it: if (variable) { ... }',
      'Use optional chaining: variable?.property instead of variable.property',
      'Provide a default value: variable || defaultValue',
      'Make sure API calls have finished before using the data'
    ],
    
    examples: [
      'const user = undefined; console.log(user.name);',
      'const data = getData(); return data.map(item => item.id);'
    ],
    
    severity: 'high'
  },

  {
    id: 'null-property',
    name: 'Null Property Access',
    category: 'javascript',
    match: (error) => 
      error.message.includes('Cannot read properties of null') ||
      error.message.includes('Cannot access property') && error.message.includes('null'),
    
    title: 'Trying to use something that is null',
    explanation: 'You attempted to access a property on a variable that is null. This often happens when a function returns null or a property is explicitly set to null.',
    
    fixes: [
      'Add null check: if (variable !== null) { ... }',
      'Use optional chaining: variable?.property',
      'Provide fallback: variable || defaultValue',
      'Check function return values'
    ],
    
    examples: [
      'const user = null; console.log(user.name);',
      'document.getElementById(\'missing\').textContent = \'hello\';'
    ],
    
    severity: 'high'
  },

  {
    id: 'map-not-function',
    name: 'Map Called on Non-Array',
    category: 'javascript',
    match: (error) => 
      error.message.includes('map is not a function') ||
      error.message.includes('.map') && error.message.includes('not a function'),
    
    title: 'Called map() on something that isn\'t an array',
    explanation: 'You tried to use the map() method on a value that isn\'t an array. This commonly happens when APIs return objects instead of arrays, or when data is undefined/null.',
    
    fixes: [
      'Verify it\'s an array first: Array.isArray(variable)',
      'Convert to array: Array.from(variable) or [...variable]',
      'Use optional chaining: variable?.map(...)',
      'Check API response structure'
    ],
    
    examples: [
      'const users = {}; users.map(u => u.name);',
      'const data = getData(); // returns object, not array'
    ],
    
    severity: 'high'
  },

  {
    id: 'not-defined',
    name: 'Variable Not Defined',
    category: 'javascript',
    match: (error) => 
      error.message.includes('is not defined') ||
      error.name === 'ReferenceError',
    
    title: 'Using a variable that doesn\'t exist',
    explanation: 'You tried to use a variable that hasn\' been declared. This could be a typo, missing import, or using a variable before it\'s defined.',
    
    fixes: [
      'Check spelling of the variable name',
      'Import the variable/module: import { name } from \'module\'',
      'Declare the variable: const name = value',
      'Check if variable is in scope'
    ],
    
    examples: [
      'console.log(usserName); // typo',
      'React.useState // missing import'
    ],
    
    severity: 'medium'
  },

  // === JSON ERRORS ===
  {
    id: 'json-parse-error',
    name: 'JSON Parse Error',
    category: 'json',
    match: (error) => 
      error.message.includes('Unexpected token') && error.message.includes('JSON') ||
      error.message.includes('JSON.parse') ||
      error.message.includes('not valid JSON'),
    
    title: 'Failed to parse JSON data',
    explanation: 'The response you received isn\'t valid JSON. This usually means the API returned HTML (like an error page) instead of JSON, or the JSON is malformed.',
    
    fixes: [
      'Check response.status before parsing: if (response.ok) { ... }',
      'Log raw response first: console.log(await response.text())',
      'Verify API endpoint URL is correct',
      'Check if server is returning proper JSON headers'
    ],
    
    examples: [
      'JSON.parse("<html>Error page</html>")',
      'await response.json() // when response is HTML'
    ],
    
    severity: 'high'
  },

  // === NETWORK ERRORS ===
  {
    id: 'fetch-failed',
    name: 'Network Request Failed',
    category: 'network',
    match: (error) => 
      error.message.includes('fetch failed') ||
      error.message.includes('NetworkError') ||
      error.message.includes('ECONNREFUSED'),
    
    title: 'Network request failed',
    explanation: 'The network request couldn\'t be completed. This could be due to no internet connection, wrong URL, server being down, or CORS issues.',
    
    fixes: [
      'Check internet connection',
      'Verify the URL is correct',
      'Make sure the server is running',
      'Check if the URL is accessible in browser',
      'For CORS: ensure server allows your origin'
    ],
    
    examples: [
      'fetch("http://localhost:3000/api") // server not running',
      'fetch("https://wrong-url.com/api")'
    ],
    
    severity: 'medium'
  },

  // === ASYNC ERRORS ===
  {
    id: 'await-outside-async',
    name: 'Await Outside Async Function',
    category: 'async',
    match: (error) => 
      error.message.includes('await is only valid in async functions') ||
      error.message.includes('await is only valid in async'),
    
    title: 'Used await outside an async function',
    explanation: 'You can only use the await keyword inside functions marked with async. This ensures proper Promise handling.',
    
    fixes: [
      'Add async keyword: async function myFunc() { ... }',
      'For arrow functions: const myFunc = async () => { ... }',
      'Use .then() instead of await if not in async function',
      'Wrap in async IIFE: (async () => { await ... })()'
    ],
    
    examples: [
      'function getData() { await fetch(...); } // missing async',
      'const data = await fetch(...); // top-level await not supported'
    ],
    
    severity: 'medium'
  },

  {
    id: 'promise-rejection',
    name: 'Unhandled Promise Rejection',
    category: 'async',
    match: (error) => 
      error.message.includes('UnhandledPromiseRejectionWarning') ||
      error.name === 'UnhandledPromiseRejection',
    
    title: 'Promise rejected but not caught',
    explanation: 'A Promise was rejected but there was no .catch() or try/catch to handle it. This can cause your app to crash.',
    
    fixes: [
      'Add .catch() to the Promise: promise.catch(error => { ... })',
      'Use try/catch with await: try { await promise } catch { ... }',
      'Use .then() with error handler: promise.then(data, error => { ... })',
      'Add global error handler: process.on("unhandledRejection", ...)'
    ],
    
    examples: [
      'fetch("/api/data") // no .catch()',
      'async function() { throw new Error("oops"); } // not caught'
    ],
    
    severity: 'high'
  },

  // === NODE.JS ERRORS ===
  {
    id: 'enoent',
    name: 'File Not Found',
    category: 'nodejs',
    match: (error) => 
      error.message.includes('ENOENT') ||
      error.message.includes('no such file or directory'),
    
    title: 'File or directory doesn\'t exist',
    explanation: 'You tried to access a file that doesn\'t exist. This could be a wrong path, missing file, or incorrect working directory.',
    
    fixes: [
      'Check if file path is correct: fs.existsSync(path)',
      'Use absolute paths: path.resolve(__dirname, "file.txt")',
      'Make sure file actually exists',
      'Check working directory: process.cwd()'
    ],
    
    examples: [
      'fs.readFileSync("missing.txt")',
      'require("./missing-module")'
    ],
    
    severity: 'medium'
  },

  {
    id: 'eacces',
    name: 'Permission Denied',
    category: 'nodejs',
    match: (error) => 
      error.message.includes('EACCES') ||
      error.message.includes('permission denied'),
    
    title: 'Permission denied for file operation',
    explanation: 'You don\'t have permission to access or modify this file/directory. This is common when trying to write to protected locations.',
    
    fixes: [
      'Check file permissions: ls -la file.txt',
      'Run with appropriate permissions: sudo (if needed)',
      'Write to user-writable directory',
      'Check if file is read-only'
    ],
    
    examples: [
      'fs.writeFileSync("/etc/config.txt", "data")',
      'fs.mkdirSync("/protected/folder")'
    ],
    
    severity: 'medium'
  },

  {
    id: 'port-in-use',
    name: 'Port Already in Use',
    category: 'nodejs',
    match: (error) => 
      error.message.includes('EADDRINUSE') ||
      error.message.includes('port already in use') ||
      error.message.includes('address already in use'),
    
    title: 'Port is already being used by another process',
    explanation: 'Another application is already using this port. This commonly happens when you forget to stop a dev server before starting a new one.',
    
    fixes: [
      'Kill the process using the port: kill -9 $(lsof -ti:3000)',
      'Use a different port: PORT=3001 npm start',
      'Find and close the application using the port',
      'Restart your computer if needed'
    ],
    
    examples: [
      'app.listen(3000) // port 3000 already in use',
      'npm start // when previous server still running'
    ],
    
    severity: 'low'
  },

  // === REACT ERRORS ===
  {
    id: 'react-children',
    name: 'Invalid React Child',
    category: 'react',
    match: (error) => 
      error.message.includes('Objects are not valid as a React child') ||
      error.message.includes('Functions are not valid as a React child'),
    
    title: 'Trying to render an object as React child',
    explanation: 'React can only render strings, numbers, and JSX elements. You\'re trying to render an object or function directly.',
    
    fixes: [
      'Render specific properties: {user.name} instead of {user}',
      'Convert to string: JSON.stringify(object)',
      'Use .map() for arrays: items.map(item => <div>{item}</div>)',
      'Check what you\'re trying to render'
    ],
    
    examples: [
      '<div>{userObject}</div> // object',
      '<div>{function}</div> // function'
    ],
    
    frameworks: ['react'],
    severity: 'high'
  },

  {
    id: 'react-too-many-renders',
    name: 'Too Many React Re-renders',
    category: 'react',
    match: (error) => 
      error.message.includes('Too many re-renders') ||
      error.message.includes('Maximum update depth exceeded'),
    
    title: 'Infinite re-render loop in React',
    explanation: 'Your component is triggering state updates that cause it to re-render infinitely. This usually happens when you set state during render.',
    
    fixes: [
      'Move state updates to useEffect: useEffect(() => setState(...), [])',
      'Add dependency array to useEffect',
      'Use event handlers instead of direct state setting',
      'Check for conditional rendering that triggers updates'
    ],
    
    examples: [
      'function App() { const [count, setCount] = useState(0); setCount(count + 1); return <div>{count}</div>; }',
      'useEffect(() => setCount(count + 1)) // missing dependency array'
    ],
    
    frameworks: ['react'],
    severity: 'critical'
  },

  {
    id: 'react-hooks-rules',
    name: 'React Hooks Rules Violation',
    category: 'react',
    match: (error) => 
      error.message.includes('Hooks can only be called inside') ||
      error.message.includes('Invalid hook call'),
    
    title: 'React hook called outside component or in wrong order',
    explanation: 'React hooks must be called at the top level of function components and in the same order every time.',
    
    fixes: [
      'Only call hooks at the top level of functions',
      'Don\'t call hooks inside loops, conditions, or nested functions',
      'Move hooks outside if statements and loops',
      'Ensure you\'re in a React function component'
    ],
    
    examples: [
      'if (condition) { useState(0); } // hook inside condition',
      'function regularFunction() { useEffect(() => {}); } // hook outside component'
    ],
    
    frameworks: ['react'],
    severity: 'high'
  }
];
