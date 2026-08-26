Pod::Spec.new do |s|
  s.name         = "SalesforceReact"
  s.version      = "14.0.0-rc.0"
  s.summary      = "Salesforce Mobile SDK for iOS - SalesforceReact"
  s.homepage     = "https://github.com/forcedotcom/SalesforceMobileSDK-ReactNative"
  s.license      = { :type => "Salesforce.com Mobile SDK License", :file => "LICENSE" }
  s.author       = { "Wolfgang Mathurin" => "wmathurin@salesforce.com" }
  s.platform     = :ios, "18.0"
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
      salesforcereact.source_files = 'ios/SalesforceReact/**/*.{h,m,mm}'
      salesforcereact.public_header_files = 'ios/SalesforceReact/SFNetReactBridge.h', 'ios/SalesforceReact/SFOauthReactBridge.h', 'ios/SalesforceReact/SFSDKReactLogger.h', 'ios/SalesforceReact/SFSmartStoreReactBridge.h', 'ios/SalesforceReact/SFMobileSyncReactBridge.h', 'ios/SalesforceReact/SalesforceReactSDKManager.h'
      salesforcereact.prefix_header_contents = '#import "SFSDKReactLogger.h"'
      salesforcereact.requires_arc = true

      # Set C++20 standard required for new architecture TurboModule support.
      salesforcereact.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20'
      }

      # Pulls in dependencies needed for the new architecture (Codegen-generated
      # spec headers, ReactCommon, JSI, etc.). Defined by React Native's
      # react_native_pods.rb. This is a no-op when new arch is disabled at the
      # consuming app level.
      if defined?(install_modules_dependencies)
          install_modules_dependencies(salesforcereact)
      end
  end
end
