#import "AppDelegate.h"

@implementation AppDelegate

- (NSURL *)sourceURLForBridge:(id)bridge
{
    return [self bundleURL];
}

- (NSURL *)bundleURL
{
    return [[NSBundle mainBundle] URLForResource:@"index.ios" withExtension:@"bundle"];
}

@end
