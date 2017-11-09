const storage = require('azure-storage');
const azureConfig = require('../config/config').azure;
const Q = require('q');
const request = require('requestretry');
const fs = require('fs');
const shell = require('shelljs');
const path = require('path');

let blobService = storage.createBlobService(azureConfig.connection_string)
.withFilter(new storage.ExponentialRetryPolicyFilter());  
let blockBlobContainerName = azureConfig.container;

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
    var blockBlobName = fileName;
    var mime =  extToMimes[getExtension(fileName)];
    // Create a container for organizing blobs within the storage account.
    // Upload a BlockBlob to the newly created container
    
    var deferred = Q.defer();
    
    //console.log('uploadBlobFromUrl ' + sourceUrl);
    
    //fetch image from url and pipe it down to azure blob service
    var options = {
        url: sourceUrl,
        strictSSL: false,
        secureProtocol: 'TLSv1_method'
    };
    
    request(options)
    .on('response', function(response) {
        console.log('downloadBlobFromUrl response' + sourceUrl);
        //console.log(response.statusCode) // 200
    })
    .on('error', function(err) { 
        console.log('downloadBlobFromUrl request error ' + sourceUrl);
        deferred.reject(new Error(err));
    })
    .pipe(blobService.createWriteStreamToBlockBlob(blockBlobContainerName, blockBlobName, {clientRequestTimeoutInMs: 480000 , contentSettings: {contentType: mime}} ,function (error) {
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

exports.saveBlobFromUrl = function(sourceUrl, itemGuid, fileDir, fileName) {
    
    var deferred = Q.defer();
    
    //fetch image from url and pipe it down to azure blob service
    var options = {
        url: sourceUrl,
        strictSSL: false,
        secureProtocol: 'TLSv1_method'
    };
    
    shell.mkdir('-p', `./tmp/${itemGuid}/${fileDir}`);
    
    let destFile = fs.createWriteStream(`./tmp/${itemGuid}/${fileName}`);
    
    request(options)
    .on('response', function(response) {
        console.log('downloadBlobFromUrl response ' + sourceUrl);
        //console.log(response.statusCode) // 200
    })
    .on('error', function(err) { 
        console.log('downloadBlobFromUrl request error ' + sourceUrl);
        deferred.reject(new Error(err));
    })
    .pipe(destFile);
    
    destFile.on('finish', function() {
        console.log('saved downloadBlobFromUrl ' + sourceUrl);
        deferred.resolve();
    })
    .on('error', function(e) {
        console.log('error saving downloadBlobFromUrl ' + sourceUrl);
        deferred.reject(new Error(e));
    })
    
    return deferred.promise;
}

exports.azcopy = function(relativePath, extension){
    var mime =  extToMimes[extension];
    let isWin = process.platform == 'win32';  
    let cmd = '', dockerCmd = '';
    let absolutePath = path.resolve(relativePath);
    
    if(isWin){
        dockerCmd = `docker run --rm -v ${absolutePath}:C:\\tmp farmer1992/azcopy`;
        cmd = `${dockerCmd} \
        AzCopy \
        /Source:"C:\\tmp\" \
        /Dest:${azureConfig.base_url}${azureConfig.container} \
        /DestKey:${azureConfig.key} \
        /S \
        /Y \
        /SetContentType:"${mime}"`;
    }
    else{
        dockerCmd = `docker run --rm -v ${absolutePath}:/tmp farmer1992/azcopy:linux-latest`;
        cmd = `${dockerCmd} \
        azcopy \
        --source "/tmp" \
        --destination "${azureConfig.base_url}${azureConfig.container}" \
        --dest-key "${azureConfig.key}" \
        --recursive \
        --quiet \
        --set-content-type "${mime}"`;
    }
    
    shell.exec(cmd, {async:true});
}

exports.listBlobsUnderFolder = function(folderName){
    blobService.listBlobsSegmentedWithPrefix(blockBlobContainerName, folderName, null, function(err, result) {
        if (err) {
            //console.log("Couldn't list containers");
            console.error(err);
        } else {
            //console.log("Found blobs with prefix %s", folderName);
            //console.log(result.entries.length);
            
            result.entries.forEach(function(blob) {
                blobService.deleteBlob(blockBlobContainerName, blob.name, function(error, res){
                    if (error) {
                        //console.log("Couldn't delete blob");
                        console.error(error);
                    } 
                    //else {
                    //console.log("Deleted " + blob.name);
                    //console.log(res);
                    //}
                });
            });
        }
    });
}
