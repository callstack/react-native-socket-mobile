#import "ReactNativeSocketMobile.h"

@implementation ReactNativeSocketMobile

RCT_EXPORT_MODULE();

NSString *DecodedData = @"DecodedData";
NSString *StatusDeviceChanged = @"StatusDeviceChanged";
bool hasListeners;

+ (id)allocWithZone:(NSZone *)zone {
    static ReactNativeSocketMobile *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [super allocWithZone:zone];
    });
    return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[DecodedData, StatusDeviceChanged];
}

-(void)startObserving {
    hasListeners = YES;
}

-(void)stopObserving {
    hasListeners = NO;
}

RCT_EXPORT_METHOD(start:(NSString *)bundleId:(NSString *)developerId:(NSString *)appKey resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    __weak typeof(self) weakSelf = self;
    SKTCaptureHelper* capture = [SKTCaptureHelper sharedInstance];
    [capture pushDelegate:weakSelf];
    
    SKTAppInfo* appInfo = [SKTAppInfo new];
    appInfo.BundleID = bundleId;
    appInfo.DeveloperID = developerId;
    appInfo.AppKey = appKey;
    
    [capture openWithAppInfo:appInfo completionHandler:^(SKTResult result) {
        if (SKTSUCCESS(result)) {
            resolve(@YES);
        } else {
            NSString* code = [NSString stringWithFormat:@"%ld", result];
            reject(code, @"Start command has failed.", nil);
        }
    }];
}

RCT_EXPORT_METHOD(stop: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    __weak typeof(self) weakSelf = self;
    SKTCaptureHelper* capture = [SKTCaptureHelper sharedInstance];
    [capture popDelegate:weakSelf];
    [capture closeWithCompletionHandler :^(SKTResult result) {
        if (SKTSUCCESS(result)) {
            resolve(@YES);
        } else {
            NSString* code = [NSString stringWithFormat:@"%ld", result];
            reject(code, @"Stop command has failed.", nil);
        }
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
    SKTCaptureHelper* capture = [SKTCaptureHelper sharedInstance];
    NSArray* devices = [capture getDevicesList];
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
