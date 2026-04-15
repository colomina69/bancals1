try {
  const plugin = require('react-native-worklets/plugin');
  console.log('Plugin found!');
} catch (e) {
  console.error('Plugin NOT found:', e.message);
  try {
     const core = require('react-native-worklets-core/plugin');
     console.log('Worklets Core found!');
  } catch (e2) {
     console.error('Worklets Core NOT found:', e2.message);
  }
}
