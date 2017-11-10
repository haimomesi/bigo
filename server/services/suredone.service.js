const utils = require('../services/utils');
const suredoneConfig = require('../config/config').suredone;
const azureConfig = require('../config/config').azure;
const azureSvc = require('../services/azureBlob.service');
const rp = require('request-promise');
const requestretry = require('requestretry');
const Rx = require('rxjs/Rx');
const csv = require('csv');

require('rxjs/add/operator/retryWhen');
require('rxjs/add/operator/delayWhen');
require('rxjs/add/operator/catch');
require('rxjs/add/observable/timer');
require('rxjs/add/observable/fromPromise');

const suredoneHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Auth-User': suredoneConfig.API_user,
    'X-Auth-Token': suredoneConfig.API_access
};

exports.get = function(endpoint){
    
    var options = {
        method: 'GET',
        url: 'https://' + suredoneConfig.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        json: true,
        timeout: 240000
    };
    
    //send request
    return rp(options);
};

let post = function(endpoint, body){
    
    var options = {
        method: 'POST',
        url: 'https://' + suredoneConfig.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        form: body,
        //agent: agent
    };
    
    //send request
    return rp(options);
};

let postretry = function(endpoint, body) {
    
    var options = {
        method: 'POST',
        url: 'https://' + suredoneConfig.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        form: body,
        strictSSL: false,
        fullResponse: false
    };
    
    return requestretry(options);
}

let bulk_post = function(endpoint, body) {
    
    var options = {
        method: 'POST',
        url: 'https://' + suredoneConfig.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        body: body,
        json: true,
        fullResponse: false
    };
    
    return requestretry(options);
}

let bulk_get = function(endpoint) {
    
    var options = {
        method: 'GET',
        url: 'https://' + suredoneConfig.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        fullResponse: false,
        json: true
    };
    
    return requestretry(options);
}

let addProductToBulkArray = function(bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, selectedAction){
    mockups.forEach((mockup, index) => {
        
        if (index == 0) {
            populateVariantArray(bulkArray, notificationObj, true, itemGuid, mockup, mockup.allVariantsUnderColorCode[0], '0', selectedAction);
        }
        
        mockup.allVariantsUnderColorCode.forEach(variantUnderColorCode => {
            notificationObj.totalVariantsProcessed++;
            populateVariantArray(bulkArray, notificationObj, false, itemGuid, mockup, variantUnderColorCode, '1000', selectedAction);
            notificationObj.totalVariantsUploaded++;
            utils.notifySocket(wss, socketId, itemGuid, 'uploading', notificationObj);
        });
    });
};

let relistProductToBulkArray = function(bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, selectedAction){
    mockups.forEach((mockup, index) => {
        if (index == 0) {
            populateRelistVariantArray(bulkArray, true, itemGuid, mockup, mockup.allVariantsUnderColorCode[0], selectedAction);
        }
    });
};

let relistVariantsToBulkArray = function(bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, selectedAction){
    mockups.forEach((mockup, index) => {
        mockup.allVariantsUnderColorCode.forEach(variantUnderColorCode => {
            populateRelistVariantArray(bulkArray, false, itemGuid, mockup, variantUnderColorCode, selectedAction);
        });
    });
};

let populateVariantArray = function(bulkArray, notificationObj, productRep, itemGuid, variant, variantUnderColorCode, stock, selectedAction){
    
    try {
        
        let productArray = [selectedAction];
        let g = productRep ? `${itemGuid}-${variant.repVariant.product_id}` : `${itemGuid}-${variant.repVariant.product_id}-${variant.repVariantColor}-${variantUnderColorCode.id}`;
        
        productArray.push(g); //guid
        productArray.push(`${itemGuid}-${variant.repVariant.product_id}`); //sku
        productArray.push(g); //partnumber
        productArray.push(variantUnderColorCode.price); //cost
        productArray.push(stock); //stock
        productArray.push(Math.ceil(parseFloat(variantUnderColorCode.price) * 1.3).toString()); //price
        productArray.push(`${variant.product.title} ${variant.product.model}`); //title
        productArray.push(`${azureConfig.base_url}${azureConfig.container}/${variant.mockupDestination}`); //media1
        productArray.push('DollarScent'); //brand
        productArray.push(variant.product.description); //description
        productArray.push(utils.getSizeMap(variantUnderColorCode.size)); //size
        productArray.push(variantUnderColorCode.color); //color
        productArray.push(variant.repVariantColor); //colorCode
        productArray.push(utils.getColorMap(variantUnderColorCode.color)); //colormap
        productArray.push(variant.product.department); //department
        productArray.push(variant.product.amznitemtype); //amznitemtype
        productArray.push('5'); //amzncategory
        productArray.push('PrivateLabel'); //registeredparameter
        productArray.push('sizecolor'); //variationtheme
        productArray.push('New'); //condition
        productArray.push(productRep ? '0' : variantUnderColorCode.id); //variantid
        productArray.push(variant.product.keywords); //keywords
        productArray.push(`${variant.repVariant.front.width}_${variant.repVariant.front.height}`); //frontsize
        productArray.push(itemGuid); //bigoguid
        
        variant.product.hasOwnProperty('bulletpoint1') ? productArray.push(variant.product.bulletpoint1) : productArray.push("");
        variant.product.hasOwnProperty('bulletpoint2') ? productArray.push(variant.product.bulletpoint2) : productArray.push("");
        variant.product.hasOwnProperty('bulletpoint3') ? productArray.push(variant.product.bulletpoint3) : productArray.push("");
        variant.product.hasOwnProperty('bulletpoint4') ? productArray.push(variant.product.bulletpoint4) : productArray.push("");
        variant.product.hasOwnProperty('bulletpoint5') ? productArray.push(variant.product.bulletpoint5) : productArray.push("");
        
        if(!notificationObj.designRepresentativeSet){
            notificationObj.designRepresentativeSet = true;
            productArray.push("1"); //designrep
        }
        else
        productArray.push("0"); //designrep
        
        bulkArray.push(productArray);
    }
    catch(err){
        console.error(err);
    }
};

let populateRelistVariantArray = function(bulkArray, productRep, itemGuid, variant, variantUnderColorCode, selectedAction){
    
    try {
        let productArray = [selectedAction];
        productRep ? productArray.push(`${itemGuid}-${variant.repVariant.product_id}`) : productArray.push(`${itemGuid}-${variant.repVariant.product_id}-${variant.repVariantColor}-${variantUnderColorCode.id}`); //guid
        bulkArray.push(productArray);
    }
    catch(err){
        console.error(err);
    }
};

let populateHeader = function(bulkArray, selectedAction){
    if(bulkArray.length == 0)
    {
        if(selectedAction == 'start')
        {
            bulkArray.push([
                "action=start",
                "guid",
                "sku",
                "partnumber",
                "cost",
                "stock", 
                "price", 
                "title", 
                "media1", 
                "brand", 
                "description", 
                "size", 
                "color", 
                "colorCode", 
                "colormap", 
                "department", 
                "amznitemtype", 
                "amzncategory", 
                "registeredparameter", 
                "variationtheme", 
                "condition", 
                "variantid", 
                "keywords", 
                "frontsize", 
                "bigoguid", 
                "bulletpoint1", 
                "bulletpoint2", 
                "bulletpoint3", 
                "bulletpoint4", 
                "bulletpoint5", 
                "designrep" ]
            );
        }
        else if(selectedAction == 'relist'){
            bulkArray.push([
                "action=relist",
                "guid"]
            );
        }
    }
    
}

let compare = function(a,b) {
    if (a[2] < b[2])
    return 1;
    if (a[2] > b[2])
    return -1;
    return 0;
}

exports.startProducts = function(allMockups, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid){
    
    let bulkArray = [];
    
    utils.notifySocket(wss, socketId, itemGuid, 'pending',notificationObj, 'Proccessing all variants');
    
    populateHeader(bulkArray, 'start');
    
    allMockups.forEach(mockups => {
        addProductToBulkArray(bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, 'start');    
    });
    
    let bulkBody = 'requests=';
    bulkBody += JSON.stringify(bulkArray);
    
    utils.notifySocket(wss, socketId, itemGuid, 'pending', notificationObj, 'Pushing all variants to SureDone');
    
    bulk_post('editor/items', bulkBody)
    .then(function(response){
        utils.notifySocket(wss, socketId, itemGuid, 'success', notificationObj);
    })
    .catch(function(err){
        utils.notifySocket(wss, socketId, itemGuid, 'error', notificationObj, err);
        console.error(err);
    });
};

exports.addProducts = function(allMockups, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid){
    
    let startBulkArray = [], relistBulkArray = [];
    
    utils.notifySocket(wss, socketId, itemGuid, 'pending',notificationObj, 'Proccessing all variants');
    
    populateHeader(startBulkArray, 'start');
    populateHeader(relistBulkArray, 'relist');
    
    allMockups.forEach(mockups => {
        addProductToBulkArray(startBulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, 'start');
        relistProductToBulkArray(relistBulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, 'relist');    
    });
    
    allMockups.forEach(mockups => {
        relistVariantsToBulkArray(relistBulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups, 'relist');    
    });
    
    let startBulkBody = 'requests=', relistBulkBody = 'requests=';
    startBulkBody += JSON.stringify(startBulkArray);
    relistBulkBody += JSON.stringify(relistBulkArray);
    
    utils.notifySocket(wss, socketId, itemGuid, 'pending', notificationObj, 'Pushing all drafts variants to SureDone');
    
    bulk_post('editor/items', startBulkBody)
    .then(function(response){
        
        utils.notifySocket(wss, socketId, itemGuid, 'pending', notificationObj, 'Relisting all variants to SureDone');
        bulk_post('editor/items', relistBulkBody)
        .then(function(response){
            utils.notifySocket(wss, socketId, itemGuid, 'success', notificationObj);
        })
        .catch(function(err){
            utils.notifySocket(wss, socketId, itemGuid, 'error', notificationObj, err);
            console.error(err);
        });
    })
    .catch(function(err){
        utils.notifySocket(wss, socketId, itemGuid, 'error', notificationObj, err);
        console.error(err);
    });
};

exports.deleteProduct = function(wss, socketId, productGuid){
    
    //TODO: delete design from Azure
    azureSvc.listBlobsUnderFolder(productGuid);
    
    var notificationObj = {
        action: 'delete'
    };
    
    let bulkBody = `q=bigoguid:=${productGuid}&type=items&mode=include&fields=action,guid,variantid`;
    utils.notifySocket(wss, socketId, productGuid, 'pending', notificationObj, 'Fetching items from SureDone');
    
    bulk_post('bulk/exports', bulkBody)
    .then(function(response){
        
        if(response.result != 'success' || response.actions == 0)
        {
            utils.notifySocket(wss, socketId, productGuid, 'error', notificationObj, response.message);
            return false;
        }
        
        utils.notifySocket(wss, socketId, productGuid, 'pending', notificationObj, 'Submitting delete action to SureDone');
        
        let exportRetryMechanism = Rx.Observable.defer(function () {
            return Rx.Observable.fromPromise(bulk_get(`bulk/exports/${response.export_file}`))
        })
        .map(function(res) {
            if(res.result !== 'success' || res.message !== 'Export completed successfully') {
                console.log(`${response.export_file} is pending`);
                throw 'ex';
            }
            return res.url;
        })
        .retryWhen(function(errors) {
            return errors.delay(5000);
        });
        
        let bulkBody = 'requests=';
        let bulkArray = [];
        
        exportRetryMechanism.subscribe((exportFileUrl) => {
            requestretry(exportFileUrl)
            .on('error', function(err){
                console.error(err);
            })
            .pipe(csv.parse(function(err, data){
                
                data.forEach(function(row, index) {
                    row[0] = index == 0 ? 'action=delete' : 'delete';
                    bulkArray.push(row);
                });
                
                bulkArray.sort(compare);
                
                bulkBody += JSON.stringify(bulkArray);
                
                bulk_post('editor/items', bulkBody)
                .then(function(response){
                    utils.notifySocket(wss, socketId, productGuid, 'success', notificationObj);
                })
                .catch(function(err){
                    utils.notifySocket(wss, socketId, productGuid, 'error', notificationObj, err);
                    console.error(err);
                });
            }));
        });
    })
    .catch(function(err){
        utils.notifySocket(wss, socketId, productGuid, 'error', notificationObj, err);
        console.error(err);
    });
    
}