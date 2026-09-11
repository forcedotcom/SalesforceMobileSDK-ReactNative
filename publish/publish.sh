#!/bin/bash

# if we are in publish dir cd to root
if [ ! -f gradlew ]; then
  cd ..
fi

./gradlew SalesforceReact:publishReleasePublicationToSonatypeRepository
./gradlew publishToSonatype closeSonatypeStagingRepository
