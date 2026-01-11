const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, 'app.json');

try {
  const appJsonRaw = fs.readFileSync(appJsonPath, 'utf8');
  const appJson = JSON.parse(appJsonRaw);

  // Update versions
  appJson.expo.version = "2.0.0";
  
  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.versionCode = 2;
  
  if (!appJson.expo.ios) appJson.expo.ios = {};
  appJson.expo.ios.buildNumber = "2";

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('Successfully updated app.json to version 2.0.0, versionCode 2, buildNumber 2');

} catch (error) {
  console.error('Error updating app.json:', error);
  process.exit(1);
}
