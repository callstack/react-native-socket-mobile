#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "SktCaptureHelper.h"

@interface ReactNativeSocketMobile : RCTEventEmitter <RCTBridgeModule, SKTCaptureHelperDelegate>

@end
