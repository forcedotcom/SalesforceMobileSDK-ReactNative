#!/bin/bash

#set -x

OPT_VERSION=""
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

usage ()
{
    echo "Use this script to set Mobile SDK version number in source files"
    echo "Usage: $0 -v <version>"
    echo "  where: version is the version e.g. 7.1.0"
}

parse_opts ()
{
    while getopts v:d: command_line_opt
    do
        case ${command_line_opt} in
            v)  OPT_VERSION=${OPTARG};;
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
    gsed -i "s/\"version\":.*\"[^\"]*\"/\"version\": \"${version}\"/g" ${file}
}

update_podspec ()
{
    local file=$1
    local version=$2
    gsed -i "s/s\.version.*=.*$/s.version      = \"${version}\"/g" ${file}
}

parse_opts "$@"

echo -e "${YELLOW}*** SETTING VERSION TO ${OPT_VERSION} ***${NC}"

echo "*** Updating package.json ***"
update_package_json "./package.json" "${OPT_VERSION}"
update_package_json "./ios/SalesforceReactTests/package.json" "${OPT_VERSION}"

echo "*** Updating podspecs ***"
update_podspec "./SalesforceReact.podspec" "${OPT_VERSION}"

