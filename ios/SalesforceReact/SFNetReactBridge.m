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

#import "SFNetReactBridge.h"
#import <React/RCTUtils.h>
#import <SalesforceSDKCore/NSDictionary+SFAdditions.h>
#import <SalesforceSDKCore/NSURLResponse+SFAdditions.h>
#import <SalesforceSDKCore/SFRestAPI+Blocks.h>


// Private constants
static NSString * const kMethodArg       = @"method";
static NSString * const kPathArg         = @"path";
static NSString * const kEndPointArg     = @"endPoint";
static NSString * const kQueryParams     = @"queryParams";
static NSString * const kHeaderParams    = @"headerParams";
static NSString * const kfileParams      = @"fileParams";
static NSString * const kFileMimeType    = @"fileMimeType";
static NSString * const kFileUrl         = @"fileUrl";
static NSString * const kFileName        = @"fileName";
static NSString * const kReturnBinary    = @"returnBinary";
static NSString * const kEncodedBody     = @"encodedBody";
static NSString * const kContentType     = @"contentType";
static NSString * const kHttpContentType = @"content-type";
static NSString * const kDoesNotRequireAuthentication = @"doesNotRequireAuthentication";


@implementation SFNetReactBridge

RCT_EXPORT_MODULE();

#pragma mark - Bridged methods

RCT_EXPORT_METHOD(sendRequest:(NSDictionary *)argsDict callback:(RCTResponseSenderBlock)callback)
{
    SFRestMethod method = [SFRestRequest sfRestMethodFromHTTPMethod:[argsDict nonNullObjectForKey:kMethodArg]];
    NSString* endPoint = [argsDict nonNullObjectForKey:kEndPointArg];
    NSString* path = [argsDict nonNullObjectForKey:kPathArg];
    NSDictionary* queryParams = [argsDict nonNullObjectForKey:kQueryParams];
    NSMutableDictionary* headerParams = [argsDict nonNullObjectForKey:kHeaderParams];
    NSDictionary* fileParams = [argsDict nonNullObjectForKey:kfileParams];
    
    //Set to true if boolean is absent.
    BOOL doesNotRequireAuthentication = [argsDict nonNullObjectForKey:kDoesNotRequireAuthentication] != nil && [[argsDict nonNullObjectForKey:kDoesNotRequireAuthentication] boolValue];
    BOOL returnBinary = [argsDict nonNullObjectForKey:kReturnBinary] != nil && [[argsDict nonNullObjectForKey:kReturnBinary] boolValue];
    SFRestRequest* request = nil;
    
    // Sets HTTP body explicitly for a POST, PATCH or PUT request.
    if (method == SFRestMethodPOST || method == SFRestMethodPATCH || method == SFRestMethodPUT) {
        request = [SFRestRequest requestWithMethod:method path:path queryParams:nil];
        if (! fileParams) { // when there are file params, the non-binary params need to be passed in the call to addPostFileData
            [request setCustomRequestBodyDictionary:queryParams contentType:@"application/json"];
        }
    } else {
        request = [SFRestRequest requestWithMethod:method path:path queryParams:queryParams];
    }
    request.requiresAuthentication = !doesNotRequireAuthentication;
    // Custom headers
    [request setCustomHeaders:headerParams];
    if (endPoint) {
        [request setEndpoint:endPoint];
    }
    
    // Files post
    if (fileParams) {
        // File params expected to be of the form:
        // {<fileParamNameInPost>: {fileMimeType:<someMimeType>, fileUrl:<fileUrl>, fileName:<fileNameForPost>}}
        for (NSString* fileParamName in fileParams) {
            NSDictionary* fileParam = fileParams[fileParamName];
            NSString* fileMimeType = [fileParam nonNullObjectForKey:kFileMimeType];
            NSString* fileUrl = [fileParam nonNullObjectForKey:kFileUrl];
            NSString* fileName = [fileParam nonNullObjectForKey:kFileName];
            NSData* fileData = [NSData dataWithContentsOfURL:[NSURL URLWithString:fileUrl]];
            [request addPostFileData:fileData paramName:fileParamName fileName:fileName mimeType:fileMimeType params:queryParams];
        }
    }
    
    // Disable parsing for binary request
    if (returnBinary) {
        request.parseResponse = NO;
    }
    SFRestAPI *restApiInstance = doesNotRequireAuthentication ? [SFRestAPI sharedGlobalInstance] : [SFRestAPI sharedInstance];

    __weak typeof(self) weakSelf = self;
    [restApiInstance sendRequest:request
                                      failureBlock:^(id response, NSError *e, NSURLResponse *rawResponse) {
                                          __strong typeof(self) strongSelf = weakSelf;
                                          NSMutableDictionary *responseDictionary = [[rawResponse asDictionary] mutableCopy];
                                          responseDictionary[@"body"] = [strongSelf serializableResponse:response rawResponse:rawResponse];
                                          NSMutableDictionary *errorDictionary = [NSMutableDictionary new];
                                          errorDictionary[@"error"] = e.localizedDescription;
                                          errorDictionary[@"response"] = responseDictionary;
                                          callback(@[RCTMakeError(@"sendRequest failed", nil, errorDictionary)]);
                                      }
                                  successBlock:^(id response, NSURLResponse *rawResponse) {
                                      id result;
                                      
                                      // Binary response
                                      if (returnBinary) {
                                          result = @{
                                                     kEncodedBody:[((NSData*) response) base64EncodedStringWithOptions:0],
                                                     kContentType:((NSHTTPURLResponse*) rawResponse).allHeaderFields[kHttpContentType]
                                                     };
                                      }
                                      // Some response
                                      else if (response) {
                                          __strong typeof(self) strongSelf = weakSelf;
                                          result = [strongSelf serializableResponse:response rawResponse:rawResponse];
                                      }
                                      // No response
                                      else {
                                          result = nil;
                                      }

                                      callback(@[[NSNull null], result == nil ? [NSNull null] : result]);
                                  }
     ];
}

- (id)serializableResponse:(id)response rawResponse:(NSURLResponse *)rawResponse {
    id result;
    if ([response isKindOfClass:[NSDictionary class]]) {
        result = response;
    } else if ([response isKindOfClass:[NSArray class]]) {
        result = response;
    } else {
        NSData *responseAsData = response;
        NSStringEncoding encodingType = rawResponse.textEncodingName == nil ? NSUTF8StringEncoding :  CFStringConvertEncodingToNSStringEncoding(CFStringConvertIANACharSetNameToEncoding((CFStringRef)rawResponse.textEncodingName));
        result = [[NSString alloc] initWithData:responseAsData encoding:encodingType];
    }
    return result;
}

@end
