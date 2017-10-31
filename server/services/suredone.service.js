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

var uploadVariantToSureDone = function(io, socketId, notificationObj, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination) {
    
    let formBody = {};
    
    formBody.identifier = 'guid';
    formBody.guid = `${itemGuid}-${repVariant.product_id}-${repVariantColor}-${variantsUnderColorCode.id}`;
    formBody.sku = `${itemGuid}-${repVariant.product_id}`;
    formBody.partnumber = formBody.guid;
    formBody.cost = variantsUnderColorCode.price;
    formBody.stock = '1000';
    formBody.price = Math.ceil(parseFloat(variantsUnderColorCode.price) * 1.3).toString();
    formBody.title = `${product.title} ${product.model}`;
    formBody.media1 = `${azureConfig.base_url}${azureConfig.container}/${mockupDestination}`;
    formBody.brand = 'DollarScent';
    formBody.description = product.description;
    formBody.size = utils.getSizeMap(variantsUnderColorCode.size);
    formBody.color = variantsUnderColorCode.color;
    formBody.colorCode = repVariantColor;
    formBody.colormap = utils.getColorMap(variantsUnderColorCode.color);
    formBody.department = product.department;
    formBody.amznitemtype = product.amznitemtype;
    formBody.amzncategory = '5';
    formBody.registeredparameter = 'PrivateLabel';
    formBody.variationtheme = 'sizecolor';
    formBody.condition = 'New';
    formBody.variantid = variantsUnderColorCode.id;
    formBody.keywords = product.keywords;
    formBody.frontsize = `${repVariant.front.width}_${repVariant.front.height}`;
    formBody.bigoguid = itemGuid;
    
    if (product.hasOwnProperty('bulletpoint1')) formBody.bulletpoint1 = product.bulletpoint1;
    if (product.hasOwnProperty('bulletpoint2')) formBody.bulletpoint2 = product.bulletpoint2;
    if (product.hasOwnProperty('bulletpoint3')) formBody.bulletpoint3 = product.bulletpoint3;
    if (product.hasOwnProperty('bulletpoint4')) formBody.bulletpoint4 = product.bulletpoint4;
    if (product.hasOwnProperty('bulletpoint5')) formBody.bulletpoint5 = product.bulletpoint5;
    
    notificationObj.totalVariantsProcessed++;
    //console.log('variants proccessed: ' + notificationObj.totalVariantsProcessed + '. current variant: ' + variantsUnderColorCode.id);
    
    //post('editor/items/start', formBody).then((x) => {
    postretry('editor/items/start', formBody)
    .then((x) => {
        notificationObj.totalVariantsUploaded++;
        //console.log('variants uploaded: ' + notificationObj.totalVariantsUploaded + '. current variant: ' + variantsUnderColorCode.id);
        
        let status = notificationObj.totalVariants == notificationObj.totalVariantsUploaded ? 'success': 'uploading';
        utils.notifySocket(io, socketId, itemGuid, status, notificationObj);
    })
    .catch(function(err){
        utils.notifySocket(io, socketId, itemGuid, 'error', notificationObj, err);
        console.error(err);
    });
};

exports.uploadParentToSureDone = function(io, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination, allVariantsUnderColorCode, mockups) {
    
    let formBody = {};
    
    formBody.identifier = 'guid';
    formBody.guid = `${itemGuid}-${repVariant.product_id}`;
    formBody.sku = `${itemGuid}-${repVariant.product_id}`;
    formBody.partnumber = formBody.guid;
    formBody.cost = variantsUnderColorCode.price;
    formBody.stock = '0';
    formBody.price = Math.ceil(parseFloat(variantsUnderColorCode.price) * 1.3).toString();
    formBody.title = `${product.title} ${product.model}`;
    formBody.media1 = `${azureConfig.base_url}${azureConfig.container}/${mockupDestination}`;
    formBody.brand = 'DollarScent';
    formBody.description = product.description;
    formBody.size = utils.getSizeMap(variantsUnderColorCode.size);
    formBody.color = variantsUnderColorCode.color;
    formBody.colorCode = repVariantColor;
    formBody.colormap = utils.getColorMap(variantsUnderColorCode.color);
    formBody.department = product.department;
    formBody.amznitemtype = product.amznitemtype;
    formBody.amzncategory = '5';
    formBody.registeredparameter = 'PrivateLabel';
    formBody.variationtheme = 'sizecolor';
    formBody.condition = 'New';
    formBody.variantid = variantsUnderColorCode.id;
    formBody.keywords = product.keywords;
    formBody.frontsize = `${repVariant.front.width}_${repVariant.front.height}`;
    formBody.bigoguid = itemGuid;
    
    if (product.hasOwnProperty('bulletpoint1')) formBody.bulletpoint1 = product.bulletpoint1;
    if (product.hasOwnProperty('bulletpoint2')) formBody.bulletpoint2 = product.bulletpoint2;
    if (product.hasOwnProperty('bulletpoint3')) formBody.bulletpoint3 = product.bulletpoint3;
    if (product.hasOwnProperty('bulletpoint4')) formBody.bulletpoint4 = product.bulletpoint4;
    if (product.hasOwnProperty('bulletpoint5')) formBody.bulletpoint5 = product.bulletpoint5;
    
    if(!notificationObj.designRepresentativeSet){
        notificationObj.designRepresentativeSet = true;
        formBody.designrep = '1';
    } 
    
    //console.log('product proccessed: ' + repVariant.product_id);
    
    post('editor/items/start', formBody).then((x) => {
        //console.log('product uploaded: ' + repVariant.product_id);
        
        allVariantsUnderColorCode.forEach(variantsUnderColorCode => {
            uploadVariantToSureDone(io, socketId, notificationObj, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination);
        });
    })
    .then(function(){
        mockups.forEach((mockup, index) => {
            if (index == 0) return;
            var repVariantId = mockup.variant_ids[0];
            var repVariant = productsCalculatedVariants[repVariantId];
            var repVariantColor = repVariant.color_code.substring(1);
            var allVariantsUnderColorCode = colors[repVariant.product_id][repVariantColor];
            
            let mockupDestination = `${itemGuid}/${repVariant.product_id}/${repVariantColor}.${mockup.mockup_url.slice((mockup.mockup_url.lastIndexOf(".") - 1 >>> 0) + 2)}`;
            let product = productsByKey[repVariant.product_id];
            
            azureSvc.uploadBlobFromUrl(mockup.mockup_url, mockupDestination)
            .then((x) => {                
                allVariantsUnderColorCode.forEach(variantsUnderColorCode => {
                    uploadVariantToSureDone(io, socketId, notificationObj, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination);
                });
            })
            .catch(function(err){
                utils.notifySocket(io, socketId, itemGuid, 'error',notificationObj, err);
                console.error(err);
            });
        });
    })
    .catch(function(err){
        utils.notifySocket(io, socketId, itemGuid, 'error', notificationObj, err);
        console.error(err);
    });
}

let addProductToBulkArray = function(bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups){
    mockups.forEach((mockup, index) => {
        
        if (index == 0) {
            populateVariantArray(bulkArray, notificationObj, true, itemGuid, mockup, mockup.allVariantsUnderColorCode[0], '0');
        }
        
        mockup.allVariantsUnderColorCode.forEach(variantUnderColorCode => {
            notificationObj.totalVariantsProcessed++;
            populateVariantArray(bulkArray, notificationObj, false, itemGuid, mockup, variantUnderColorCode, '1000');
            notificationObj.totalVariantsUploaded++;
            utils.notifySocket(wss, socketId, itemGuid, 'uploading', notificationObj);
        });
    });
};

let populateVariantArray = function(bulkArray, notificationObj, productRep, itemGuid, variant, variantUnderColorCode, stock){
    
    try {
        
        let productArray = ["start"];
        
        productRep ? productArray.push(`${itemGuid}-${variant.repVariant.product_id}`) : productArray.push(`${itemGuid}-${variant.repVariant.product_id}-${variant.repVariantColor}-${variantUnderColorCode.id}`); //guid
        productArray.push(`${itemGuid}-${variant.repVariant.product_id}`); //sku
        productArray.push(`${itemGuid}-${variant.repVariant.product_id}`); //partnumber
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

let populateHeader = function(bulkArray){
    if(bulkArray.length == 0)
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

let csvDeleteParser = csv.parse(function(err, data){
    let bulkBody = 'requests=';
    let bulkArray = [];
    data.forEach(function(row, index) {
        row[0] = index == 0 ? 'action=delete' : 'delete';
        bulkArray.push(row);
    });
    bulkBody += JSON.stringify(bulkArray);
    
    return bulkBody;
});

exports.addProducts = function(allMockups, bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid){
    
    utils.notifySocket(wss, socketId, itemGuid, 'pending',notificationObj, 'Proccessing all variants');
    
    populateHeader(bulkArray);
    
    allMockups.forEach(mockups => {
        addProductToBulkArray(bulkArray, wss, socketId, notificationObj, productsCalculatedVariants, colors, productsByKey, itemGuid, mockups);    
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

exports.deleteProduct = function(wss, socketId, productGuid){
    
    //TODO: delete design from Azure

    var notificationObj = {
        action: 'delete'
    };

    let bulkBody = `q=bigoguid:=${productGuid}&type=items&mode=include&fields=action,guid`;
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