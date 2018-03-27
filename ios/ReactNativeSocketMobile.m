#import "ReactNativeSocketMobile.h"

@implementation ReactNativeSocketMobile

RCT_EXPORT_MODULE();

NSString *DecodedData = @"DecodedData";
NSString *StatusDeviceChanged = @"StatusDeviceChanged";
bool hasListeners;

- (NSArray<NSString *> *)supportedEvents
{
    return @[DecodedData, StatusDeviceChanged];
}

SKTCaptureHelper* _capture;

-(void)startObserving {
    hasListeners = YES;
}

-(void)stopObserving {
    hasListeners = NO;
}

RCT_EXPORT_METHOD(start:(NSString *)bundleId:(NSString *)developerId:(NSString *)appKey resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    _capture = [SKTCaptureHelper sharedInstance];
    [_capture pushDelegate:self];
    
    SKTAppInfo* appInfo = [SKTAppInfo new];
    appInfo.BundleID = bundleId;
    appInfo.DeveloperID = developerId;
    appInfo.AppKey = appKey;
    
    [_capture openWithAppInfo:appInfo completionHandler:^(SKTResult result) {
        resolve(@YES);
    }];
}

RCT_EXPORT_METHOD(stop: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    [_capture closeWithCompletionHandler :^(SKTResult result) {
        resolve(@YES);
    }];
}

-(void)didReceiveDecodedData:(SKTCaptureDecodedData*) decodedData fromDevice:(SKTCaptureHelperDevice*) device withResult:(SKTResult) result{
    if (SKTSUCCESS(result) && hasListeners) {
        [self sendEventWithName:DecodedData body:@{@"data": [NSString stringWithUTF8String:(const char *)[decodedData.DecodedData bytes]]}];
    }
}

-(void)didNotifyArrivalForDevice:(SKTCaptureHelperDevice*) device withResult:(SKTResult) result {
    if (SKTSUCCESS(result) && hasListeners) {
        [self sendEventWithName:StatusDeviceChanged body:@{@"status": @"connected"}];
    }
}

-(void)didNotifyRemovalForDevice:(SKTCaptureHelperDevice*) device withResult:(SKTResult) result {
    if (SKTSUCCESS(result) && hasListeners) {
        [self sendEventWithName:StatusDeviceChanged body:@{@"status": @"disconnected"}];
    }
}

RCT_EXPORT_METHOD(updateStatusFromDevices: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    NSArray* devices = [_capture getDevicesList];
    NSString* newStatus = @"";
    if (devices.count == 0 ){
        newStatus = @"Waiting for a scanner...";
    } else {
        for (SKTCaptureHelperDevice* device in devices) {
            if( newStatus.length > 0) {
                newStatus = [newStatus stringByAppendingString: @", "];
            }
            newStatus = [newStatus stringByAppendingString: device.friendlyName];
        }
    }
    
    resolve(newStatus);
}

@end
