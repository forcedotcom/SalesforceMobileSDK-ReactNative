#!/bin/bash

#set -x

# SCOPE: This script only stamps the Mobile SDK *version* number — the
# package.json "version" field, the SalesforceMobileSDK git tag in the test
# apps' package.json, and s.version in SalesforceReact.podspec — then rebuilds
# dist/ and the Android codegen.
#
# It does NOT update the React Native platform/toolchain values. Those must be
# bumped MANUALLY on each upgrade and kept in sync with the "Version
# Compatibility" table in README.md:
#   - react-native / react / @react-native-* / @react-native-community/cli
#     versions in package.json, iosTests/package.json, androidTests/package.json,
#     and react-android/hermes-android in androidTests/android/app/build.gradle.kts
#   - iOS minimum deployment target: SalesforceReact.podspec (s.platform),
#     iosTests/ios/Podfile, and IPHONEOS_DEPLOYMENT_TARGET in project.pbxproj
#   - Android minSdk: android/build.gradle and androidTests/android build files

OPT_VERSION=""
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

usage ()
{
    echo "Use this script to set Mobile SDK version number in source files"
    echo "Usage: $0 -v <version> [-d <isDev>]"
    echo "  where: version is the version e.g. 7.1.0"
    echo "         isDev is yes or no (default) to indicate whether it is a dev build"
}

parse_opts ()
{
    while getopts v:d: command_line_opt
    do
        case ${command_line_opt} in
            v)  OPT_VERSION=${OPTARG};;
            d)  OPT_IS_DEV=${OPTARG};;	    
        esac
    done

    if [ "${OPT_VERSION}" == "" ]
    then
        echo -e "${RED}You must specify a value for the version.${NC}"
        usage
        exit 1
    fi
}

# Helper functions
update_package_json ()
{
    local file=$1
    local version=$2
    local sdkTag=$3
    gsed -i "s/\"version\":.*\"[^\"]*\"/\"version\": \"${version}\"/g" ${file}
    gsed -i "s/\(SalesforceMobileSDK.*\)\#[^\"]*\"/\1\#${sdkTag}\"/g" ${file}
}

update_podspec ()
{
    local file=$1
    local version=$2
    gsed -i "s/s\.version.*=.*$/s.version      = \"${version}\"/g" ${file}
}

parse_opts "$@"

SDK_TAG=""
if [ "$OPT_IS_DEV" == "yes" ]
then
    SDK_TAG="dev"
else
    SDK_TAG="v${OPT_VERSION}"
fi

echo -e "${YELLOW}*** POINTING TO SDK TAG ${SDK_TAG} ***${NC}"

echo "*** Updating package.json ***"
update_package_json "./package.json" "${OPT_VERSION}" "${SDK_TAG}"
update_package_json "./iosTests/package.json" "${OPT_VERSION}" "${SDK_TAG}"
update_package_json "./androidTests/package.json" "${OPT_VERSION}" "${SDK_TAG}"

echo "*** Updating podspecs ***"
update_podspec "./SalesforceReact.podspec" "${OPT_VERSION}"

echo "*** Updating dist ***"
npm install
npx tsc --project tsconfig.build.json

echo "*** Updating Android codegen ***"
rm -rf android/generated/source/codegen
npx react-native codegen --path . --outputPath . --platform android
mv android/app/build/generated/source/codegen android/generated/source/codegen
rm -rf android/app
