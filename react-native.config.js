module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.salesforce.androidsdk.reactnative.app.SalesforceReactPackage;',
        packageInstance: 'new SalesforceReactPackage()',
      },
    },
  },
};
