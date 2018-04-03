# react-native-socket-mobile

[![CircleCI](https://circleci.com/gh/Traede/react-native-socket-mobile.svg?style=shield)](https://circleci.com/gh/Traede/react-native-socket-mobile) [![Coverage Status](https://coveralls.io/repos/github/Traede/react-native-socket-mobile/badge.svg?branch=master)](https://coveralls.io/github/Traede/react-native-socket-mobile?branch=master)
[![npm version](https://badge.fury.io/js/react-native-socket-mobile.svg)](https://badge.fury.io/js/react-native-socket-mobile) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This native module is a wrapper over the [Socket Mobile SDK](https://www.socketmobile.com/developer/portal/welcome). If you have a developer account and valid credentials, you will be able to use your scanner within your React Native application.

## Table of contents
- [Installation](#installation)
- [API Reference](#api-reference)

## Installation

Add the library using `yarn` or `npm`:

```bash
yarn add react-native-socket-mobile
```

### iOS

This library depends on the [SKTCaptureObjC SDK](https://github.com/SocketMobile/cocoapods-capture-obj-c). We will be using Cocoapods.

1. Install [CocoaPods](https://cocoapods.org/) on your marchine.
2. Within you application, go to the `ios/` directory and run `pod init`
3. Replace the content within your brand-new `Podfile` with:

```ruby
source 'https://github.com/CocoaPods/Specs.git'

platform :ios, '9.0'

target 'YourAppName' do
  node_modules_path = '../node_modules'

  pod 'yoga', path: "#{node_modules_path}/react-native/ReactCommon/yoga/yoga.podspec"
  pod 'React', path: "#{node_modules_path}/react-native"

  pod 'ReactNativeSocketMobile', path: path: "#{node_modules_path}/react-native-socket-mobile/ios"
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == "React"
      target.remove_from_project
    end
  end
end
```
4. Run `pod install`.
5. Open <YOUR_PROJECT_NAME>.xcworkspace file (you'll need to use it as a starting file from now on).
6. **Important**: You need to add the following to your XCode project:

| Info        |            |
| ------------- |:-------------:|
| Supported external accessory protocols      | com.socketmobile.chs |

### Android

No support for now.

## API Reference

#### `start({ bundleId: string, developerId: string, appKey: string }): Promise<boolean | Error>`
Start listening for a scanner to be connected.
```js
start = async () => {
  try {
    await SocketMobile.start({
      bundleId,
      developerId,
      appKey,
    });
  } catch (e) {
    // Handle the error
  }
};
```

#### `stop() : Promise<boolean | Error>`
Stop connection to the scanner.
```js
stop = async () => {
  try {
    await SocketMobile.stop();
  } catch (e) {
    // Handle the error
  }
};
```

#### `updateStatusFromDevices() : Promise<string>`
Get current list of connected devices.
```js
updateStatusFromDevices = async () => {
  const status = await SocketMobile.updateStatusFromDevices();
};
```
  
#### `setDataListener(callback: (result: { data: string }): void`
Listens for scanning results (after we got connected to the device).
```js
SocketMobile.setDataListener(({ data }) => {
  this.setState({ lastScan: data });
});
```

#### `setDeviceStatusListener(callback: (status: 'connected'|'disconnected'): void`
Listen for scanner connection changes.
```js
SocketMobile.setDeviceStatusListener(status => {
  if (status === 'connected') {
    this.setState({ status: 'connected' });
  } else {
    this.setState({ status: 'disconnected' });
  }
});
```

#### `clearAllListeners() : void`
Remove all listeners, typically called in `componentWillUmmount`.
```js
componentWillUnmount() {
  SocketMobile.clearAllListeners();
}
```
