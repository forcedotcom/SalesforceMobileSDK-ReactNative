/*
 Copyright (c) 2015-present, salesforce.com, inc. All rights reserved.

 Redistribution and use of this software in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list of conditions
 and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 conditions and the following disclaimer in the documentation and/or other materials provided
 with the distribution.
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to
 endorse or promote products derived from this software without specific prior written
 permission of salesforce.com, inc.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#import "SFMobileSyncReactBridge.h"
#import "SFSDKReactLogger.h"
#import <React/RCTUtils.h>
#import <SalesforceSDKCore/NSDictionary+SFAdditions.h>
#import <SalesforceSDKCore/SFUserAccountManager.h>
#import <SmartStore/SFSmartStore.h>
#import <MobileSync/SFMobileSyncSyncManager.h>
#import <MobileSync/SFSyncState.h>

// Private constants
NSString * const kSyncSoupNameArg = @"soupName";
NSString * const kSyncTargetArg = @"target";
NSString * const kSyncOptionsArg = @"options";
NSString * const kSyncIdArg = @"syncId";
NSString * const kSyncNameArg = @"syncName";
NSString * const kSyncEventType = @"sync";
NSString * const kSyncDetail = @"detail";
NSString * const kSyncIsGlobalStoreArg = @"isGlobalStore";
NSString * const kSyncStoreName = @"storeName";

@implementation SFMobileSyncReactBridge

RCT_EXPORT_MODULE();

#pragma mark - Bridged methods

RCT_EXPORT_METHOD(getSyncStatus:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback)
{
    NSNumber *syncId = (NSNumber *) [args sfsdk_nonNullObjectForKey:kSyncIdArg];
    NSString *syncName = (NSString *) [args sfsdk_nonNullObjectForKey:kSyncNameArg];

    SFSyncState *sync;
    if (syncId) {
        [SFSDKReactLogger d:[self class] format:@"getSyncStatus with sync id: %@", syncId];
        sync = [[self getSyncManagerInst:args] getSyncStatus:syncId];
    }
    else if (syncName) {
        [SFSDKReactLogger d:[self class] format:@"getSyncStatus with sync name: %@", syncName];
        sync = [[self getSyncManagerInst:args] getSyncStatusByName:syncName];
    }
    else {
        callback(@[RCTMakeError(@"Neither syncId nor syncName were specified", nil, nil)]);
    }
    callback(@[[NSNull null], sync == nil ? [NSNull null] : [sync asDict]]);
}

RCT_EXPORT_METHOD(deleteSync:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback)
{
    NSNumber *syncId = (NSNumber *) [args sfsdk_nonNullObjectForKey:kSyncIdArg];
    NSString *syncName = (NSString *) [args sfsdk_nonNullObjectForKey:kSyncNameArg];

    if (syncId) {
        [SFSDKReactLogger d:[self class] format:@"deleteSync with sync id: %@", syncId];
        [[self getSyncManagerInst:args] deleteSyncById:syncId];
    }
    else if (syncName) {
        [SFSDKReactLogger d:[self class] format:@"deleteSync with sync name: %@", syncName];
        [[self getSyncManagerInst:args] deleteSyncByName:syncName];
    }
    else {
        callback(@[RCTMakeError(@"Neither syncId nor syncName were specified", nil, nil)]);
    }
    callback(@[[NSNull null], @"OK"]);
}

RCT_EXPORT_METHOD(syncDown:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback)
{
    NSString *syncName = [args sfsdk_nonNullObjectForKey:kSyncNameArg];
    NSString *soupName = [args sfsdk_nonNullObjectForKey:kSyncSoupNameArg];
    SFSyncOptions *options = [SFSyncOptions newFromDict:[args sfsdk_nonNullObjectForKey:kSyncOptionsArg]];
    SFSyncDownTarget *target = [SFSyncDownTarget newFromDict:[args sfsdk_nonNullObjectForKey:kSyncTargetArg]];
    __weak typeof(self) weakSelf = self;
    NSError* error = nil;
    SFSyncState* sync = [[self getSyncManagerInst:args] syncDownWithTarget:target options:options soupName:soupName syncName:syncName updateBlock:^(SFSyncState* sync) {
        [weakSelf handleSyncUpdate:sync withArgs:args callback:callback];
    } error:&error];
    if (sync) {
        [SFSDKReactLogger d:[self class] format:@"syncDown # %ld to soup: %@", sync.syncId, soupName];
    }
    else {
        NSString *errorMessage = [NSString stringWithFormat:@"syncDown failed, error: %@, `args`: %@.", error, args];
        callback(@[RCTMakeError(errorMessage, nil, nil)]);
    }
}

RCT_EXPORT_METHOD(reSync:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback) {
    NSString *syncName = [args sfsdk_nonNullObjectForKey:kSyncNameArg];
    NSNumber *syncId = (NSNumber *) [args sfsdk_nonNullObjectForKey:kSyncIdArg];
    SFSyncState* sync;
    NSError* error = nil;
    if (syncId) {
        [SFSDKReactLogger d:[self class] format:@"reSync with sync id: %@", syncId];
        __weak typeof(self) weakSelf = self;
        sync = [[self getSyncManagerInst:args] reSync:syncId updateBlock:^(SFSyncState *sync) {
            [weakSelf handleSyncUpdate:sync withArgs:args callback:callback];
        } error:&error];
    }
    else if (syncName) {
        [SFSDKReactLogger d:[self class] format:@"reSync with sync name: %@", syncName];
        __weak typeof(self) weakSelf = self;
        sync = [[self getSyncManagerInst:args] reSyncByName:syncName updateBlock:^(SFSyncState *sync) {
            [weakSelf handleSyncUpdate:sync withArgs:args callback:callback];
        } error:&error];
    }
    else {
        callback(@[RCTMakeError(@"Neither syncId nor syncName were specified", nil, nil)]);
    }

    if (sync == nil) {
        NSString *errorMessage = [NSString stringWithFormat:@"reSync failed, error: %@, `args`: %@.", error, args];
        callback(@[RCTMakeError(errorMessage, nil, nil)]);
    }
}

RCT_EXPORT_METHOD(cleanResyncGhosts:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback)
{
    NSNumber* syncId = (NSNumber*) [args sfsdk_nonNullObjectForKey:kSyncIdArg];
    [SFSDKReactLogger d:[self class] format:@"cleanResyncGhosts with sync id: %@", syncId];
    __weak typeof(self) weakSelf = self;
    NSError* error = nil;
    [[self getSyncManagerInst:args] cleanResyncGhosts:syncId completionStatusBlock:^void(SFSyncStateStatus syncStatus, NSUInteger numRecords){
        [weakSelf handleCleanReSyncGhosts:syncStatus numRecords:numRecords callback:callback];
    } error:&error];

    if (error) {
        NSString *errorMessage = [NSString stringWithFormat:@"cleanResyncGhosts failed, error: %@, `args`: %@.", error, args];
        callback(@[RCTMakeError(errorMessage, nil, nil)]);
    }
}

RCT_EXPORT_METHOD(syncUp:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback)
{
    NSString *syncName = [args sfsdk_nonNullObjectForKey:kSyncNameArg];
    NSString *soupName = [args sfsdk_nonNullObjectForKey:kSyncSoupNameArg];
    SFSyncOptions *options = [SFSyncOptions newFromDict:[args sfsdk_nonNullObjectForKey:kSyncOptionsArg]];
    SFSyncUpTarget *target = [SFSyncUpTarget newFromDict:[args sfsdk_nonNullObjectForKey:kSyncTargetArg]];
    __weak typeof(self) weakSelf = self;
    NSError* error = nil;
    SFSyncState* sync = [[self getSyncManagerInst:args] syncUpWithTarget:target options:options soupName:soupName syncName:syncName updateBlock:^(SFSyncState* sync) {
        [weakSelf handleSyncUpdate:sync withArgs:args callback:callback];
    } error:&error];

    if (sync) {
        [SFSDKReactLogger d:[self class] format:@"syncUp # %ld from soup: %@", sync.syncId, soupName];
    }
    else {
        NSString *errorMessage = [NSString stringWithFormat:@"syncUp failed, error: %@, `args`: %@.", error, args];
        callback(@[RCTMakeError(errorMessage, nil, nil)]);
    }
}


#pragma mark - Helper methods

- (SFMobileSyncSyncManager *)getSyncManagerInst:(NSDictionary *) argsDict
{
    SFSmartStore *smartStore = [self getStoreInst:argsDict];
    return [SFMobileSyncSyncManager sharedInstanceForStore:smartStore];
}

- (BOOL)isGlobal:(NSDictionary *)args
{
    return args[kSyncIsGlobalStoreArg] != nil && [args[kSyncIsGlobalStoreArg] boolValue];
}

- (void)handleCleanReSyncGhosts:(SFSyncStateStatus)syncStatus numRecords:(NSUInteger)numRecords callback:(RCTResponseSenderBlock)callback
{
    if (syncStatus == SFSyncStateStatusDone) {
        callback(@[[NSNull null],  [NSNumber numberWithUnsignedInteger:numRecords]]);
    } else {
        callback(@[RCTMakeError(@"cleanResyncGhosts failed", nil, nil)]);
    }
}

- (void)handleSyncUpdate:(SFSyncState *)sync withArgs:(NSDictionary *)args callback:(RCTResponseSenderBlock)callback
{
    NSMutableDictionary* syncDict = [NSMutableDictionary dictionaryWithDictionary:[sync asDict]];
    BOOL isGlobal = [self isGlobal:args];
    syncDict[kSyncIsGlobalStoreArg] = isGlobal ? @YES : @NO;
    syncDict[kSyncStoreName] = [self storeName:args];
    if (sync.status == SFSyncStateStatusDone) {
        callback(@[[NSNull null], syncDict]);
    } else if (sync.status == SFSyncStateStatusFailed) {
        //Return sync to React Native with the error message in the JSON
        callback(@[RCTMakeError(@"Sync failed", nil, syncDict), syncDict]);
    }
}

- (SFSmartStore *)getStoreInst:(NSDictionary *)args
{
    NSString *storeName = [self storeName:args];
    BOOL isGlobal = [self isGlobal:args];
    SFSmartStore *storeInst = [self storeWithName:storeName isGlobal:isGlobal];
    return storeInst;
}

- (SFSmartStore *)storeWithName:(NSString *)storeName isGlobal:(BOOL) isGlobal
{
    SFSmartStore *store = isGlobal?[SFSmartStore sharedGlobalStoreWithName:storeName]:
    [SFSmartStore sharedStoreWithName:storeName];
    return store;
}

- (NSString *)storeName:(NSDictionary *)args
{
    NSString *storeName = [args sfsdk_nonNullObjectForKey:kSyncStoreName];
    if(storeName==nil) {
        storeName = kDefaultSmartStoreName;
    }
    return storeName;
}

@end
