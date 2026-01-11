try {
  require.resolve('react-native-worklets/plugin');
  console.log('Success: react-native-worklets/plugin found');
} catch (error) {
  console.error('Error: react-native-worklets/plugin NOT found');
  console.error(error.message);
}
