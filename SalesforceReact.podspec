Pod::Spec.new do |s|
  s.name         = "SalesforceReact"
  s.version      = "10.1.0"
  s.summary      = "Salesforce Mobile SDK for iOS - SalesforceReact"
  s.homepage     = "https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative"
  s.license      = { :type => "Salesforce.com Mobile SDK License", :file => "LICENSE" }
  s.author       = { "Wolfgang Mathurin" => "wmathurin@salesforce.com" }
  s.platform     = :ios, "14.0"
  s.source       = { :git => "https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative.git",
                     :tag => "v#{s.version}",
                     :submodules => false }
  s.requires_arc = true
  s.default_subspec  = 'SalesforceReact'
  s.subspec 'SalesforceReact' do |salesforcereact|
      salesforcereact.dependency 'React-Core'
      salesforcereact.dependency 'SalesforceSDKCommon', "~>#{s.version}"
      salesforcereact.dependency 'SalesforceAnalytics', "~>#{s.version}"
      salesforcereact.dependency 'SalesforceSDKCore', "~>#{s.version}"
      salesforcereact.dependency 'SmartStore', "~>#{s.version}"
      salesforcereact.dependency 'MobileSync', "~>#{s.version}"
      salesforcereact.source_files = 'ios/SalesforceReact/**/*.{h,m}'
      salesforcereact.public_header_files = 'ios/SalesforceReact/SFNetReactBridge.h', 'ios/SalesforceReact/SFOauthReactBridge.h', 'ios/SalesforceReact/SFSDKReactLogger.h', 'ios/SalesforceReact/SFSmartStoreReactBridge.h', 'ios/SalesforceReact/SFMobileSyncReactBridge.h', 'libs/SalesforceReact/SalesforceReact/SalesforceReact.h', 'ios/SalesforceReact/SalesforceReactSDKManager.h'
      salesforcereact.prefix_header_contents = '#import "SFSDKReactLogger.h"'
      salesforcereact.requires_arc = true
  end
end
