const storage = require('azure-storage');
const azureConfig = require('../config/config').azure;
const Q = require('q');
const request = require('requestretry');

let extToMimes = {
    'img': 'image/jpeg',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
}

var getExtension = function(fileName){
    return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
} 

exports.uploadBlobFromLocalFile = function(fileToUpload, fileName) {
    
    // Create a blob client for interacting with the blob service from connection string
    // How to create a storage connection string - http://msdn.microsoft.com/en-us/library/azure/ee758697.aspx
    var blobService = storage.createBlobService(azureConfig.connection_string)
    .withFilter(new storage.ExponentialRetryPolicyFilter());  
    var blockBlobContainerName = azureConfig.container;
    var blockBlobName = fileName;
    
    var deferred = Q.defer();
    
    // Create a container for organizing blobs within the storage account.
    // Upload a BlockBlob to the newly created container
    blobService.createBlockBlobFromLocalFile(blockBlobContainerName, blockBlobName, fileToUpload, function (error) {
        if (error){
            deferred.reject(new Error(error));
        } else{
            deferred.resolve();
        }
    });
    
    return deferred.promise;
}

exports.uploadBlobFromStream = function(streamToUpload, fileName) {
    
    // Create a blob client for interacting with the blob service from connection string
    // How to create a storage connection string - http://msdn.microsoft.com/en-us/library/azure/ee758697.aspx
    var blobService = storage.createBlobService(azureConfig.connection_string)
    .withFilter(new storage.ExponentialRetryPolicyFilter());  
    var blockBlobContainerName = azureConfig.container;
    var blockBlobName = fileName;
    var mime =  extToMimes[getExtension(fileName)];
    // Create a container for organizing blobs within the storage account.
    // Upload a BlockBlob to the newly created container
    
    var deferred = Q.defer();
    
    streamToUpload.pipe(blobService.createWriteStreamToBlockBlob(blockBlobContainerName, blockBlobName, {contentSettings: {contentType: mime}}, function (error) {
        if (error){
            deferred.reject(new Error(error));
        } else{
            deferred.resolve();
        }
    }));
    
    return deferred.promise;
}

exports.uploadBlobFromUrl = function(sourceUrl, fileName) {
    
    // Create a blob client for interacting with the blob service from connection string
    // How to create a storage connection string - http://msdn.microsoft.com/en-us/library/azure/ee758697.aspx
    var blobService = storage.createBlobService(azureConfig.connection_string)
    .withFilter(new storage.ExponentialRetryPolicyFilter()); 
    var blockBlobContainerName = azureConfig.container;
    var blockBlobName = fileName;
    var mime =  extToMimes[getExtension(fileName)];
    // Create a container for organizing blobs within the storage account.
    // Upload a BlockBlob to the newly created container
    
    var deferred = Q.defer();

    console.log('uploadBlobFromUrl ' + sourceUrl);
    
    //fetch image from url and pipe it down to azure blob service
    var options = {
        url: sourceUrl,
        strictSSL: false,
        secureProtocol: 'TLSv1_method'
    };

    request(options)
    .on('error', function(err) { 
        console.log('uploadBlobFromUrl request error ' + sourceUrl);
        deferred.reject(new Error(err));
     })
    .pipe(blobService.createWriteStreamToBlockBlob(blockBlobContainerName, blockBlobName, {timeoutIntervalInMs:240000, clientRequestTimeoutInMs: 240000 , contentSettings: {contentType: mime}} ,function (error) {
        if (error){
            console.log('uploadBlobFromUrl error ' + sourceUrl);
            deferred.reject(new Error(error));
        } else{
            console.log('uploadBlobFromUrl success ' + sourceUrl);
            deferred.resolve();
        }
    }));
    
    return deferred.promise;
}

