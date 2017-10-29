const utils = require('../services/utils');
const suredoneConfig = require('../config/config').suredone;
const azureConfig = require('../config/config').azure;
const azureSvc = require('../services/azureBlob.service');
const rp = require('request-promise');
const requestretry = require('requestretry');

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

var uploadVariantToSureDone = function(io, socketId, variantsUploadState, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination) {
    
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
    
    variantsUploadState.totalVariantsProcessed++;
    console.log('variants proccessed: ' + variantsUploadState.totalVariantsProcessed + '. current variant: ' + variantsUnderColorCode.id);
    
    //post('editor/items/start', formBody).then((x) => {
    postretry('editor/items/start', formBody)
    .then((x) => {
        variantsUploadState.totalVariantsUploaded++;
        console.log('variants uploaded: ' + variantsUploadState.totalVariantsUploaded + '. current variant: ' + variantsUnderColorCode.id);
        
        let status = variantsUploadState.totalVariants == variantsUploadState.totalVariantsUploaded ? 'success': 'uploading';
        utils.notifySocket(io, socketId, itemGuid, status, variantsUploadState);
    })
    .catch(function(err){
        utils.notifySocket(io, socketId, itemGuid, 'error', null, err);
        console.error(err);
    });
};

exports.uploadParentToSureDone = function(io, socketId, variantsUploadState, productsCalculatedVariants, colors, productsByKey, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination, allVariantsUnderColorCode, mockups) {
    
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
    
    if(!variantsUploadState.designRepresentativeSet){
        variantsUploadState.designRepresentativeSet = true;
        formBody.designrep = '1';
    } 
    
    console.log('product proccessed: ' + repVariant.product_id);
    
    post('editor/items/start', formBody).then((x) => {
        console.log('product uploaded: ' + repVariant.product_id);
        
        allVariantsUnderColorCode.forEach(variantsUnderColorCode => {
            uploadVariantToSureDone(io, socketId, variantsUploadState, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination);
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
                    uploadVariantToSureDone(io, socketId, variantsUploadState, itemGuid, repVariant, repVariantColor, variantsUnderColorCode, product, mockupDestination);
                });
            })
            .catch(function(err){
                utils.notifySocket(io, socketId, itemGuid, 'error', null, err);
                console.error(err);
            });
        });
    })
    .catch(function(err){
        utils.notifySocket(io, socketId, itemGuid, 'error', null, err);
        console.error(err);
    });
}