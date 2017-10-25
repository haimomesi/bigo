const multiparty = require('multiparty');
const azureSvc = require('../services/azureBlob.service');
const printfulSvc = require('../services/printful.service');
const suredoneSvc = require('../services/suredone.service');
const fs = require('fs'); 
const utils = require('../services/utils');
const Q = require('q');
const azureConfig = require('../config/config').azure;
const Rx = require('rxjs/Rx');

require('rxjs/add/operator/retryWhen');
require('rxjs/add/operator/delayWhen');
require('rxjs/add/operator/catch');
require('rxjs/add/observable/timer');
require('rxjs/add/observable/fromPromise');

function DesignController(io){
    
    const ctrl = {};
    
    // Display list of all designs
    ctrl.design_list = function(req, res) {
        // let designs = [{
        //     guid: 'e2c784591e4c4349',
        //     title: 'Hancock Gasoline',
        //     keywords: 'blah blah blah'
        // }];
        let designs = [];
        
        suredoneSvc.get('search/items/designrep:=1')
        .then(function(itemsResponse){
            for(key in itemsResponse) 
            {
                if(itemsResponse.hasOwnProperty(key) && !isNaN(key))
                {
                    var item = {};
                    item.sku = itemsResponse[key].sku.split('-')[0];
                    item.image = itemsResponse[key].media1.split(item.sku)[0] + item.sku + '/front_1500_1500.png';
                    item.title = itemsResponse[key].title;
                    
                    designs.push(item);
                }
            }

            res.send(designs);
        })
        .catch(function(error){
            res.send();
        });
    };
    
    // Display detail page for a specific design
    ctrl.design_detail = function(req, res) {
        res.send('NOT IMPLEMENTED: Design detail: ' + req.params.id);
    };
    
    // Display design create form on GET
    ctrl.design_create_get = function(req, res) {
        res.send('NOT IMPLEMENTED: Design create GET');
    };
    
    // Handle design create on POST
    ctrl.design_create_post = function(req, res) {
        
        //res.send('NOT IMPLEMENTED: Design create POST');
        //notify user thru socket
        res.send();
        
        let form = new multiparty.Form();
        let products = {}, 
        productsVariants = [], 
        productsPrintFiles = [],
        productsCalculatedVariants = {},
        productsByKey = {},
        colors = {},
        printfileIds = {};
        printfileVariants = {},
        mockupGeneratorSubscriptions = [],
        possibleSizes = {},
        possibleAspectRatios = {};
        
        form.parse(req, function(err, fields, files) {
            
            let socketId = fields.socketId[0];
            let itemGuid = fields.guid[0];
            let frontDestinations = {};
            
            //notify user thru socket
            utils.notifySocket(io, socketId, itemGuid, 'pending', null, 'Fetching products from Printful');
            
            printfulSvc.get('products')
            .then(function(productsResponse){
                let bellaProducts = productsResponse.result.filter((prod) => {
                    if(prod.brand == "Bella + Canvas" && prod.type === 'T-SHIRT' && !prod.dimensions && prod.variant_count > 1 && !utils.containsWord(prod))
                    {
                        utils.setExtraFields(prod, fields);
                        productsByKey[prod.id] = prod;
                        productsPrintFiles.push(printfulSvc.get('mockup-generator/printfiles/' + prod.id));
                        productsVariants.push(printfulSvc.get('products/' + prod.id));
                        return true;
                    }
                    return false;
                });
                
                return Q.all(productsPrintFiles);
            })
            .then(function(productsPrintFilesResults){
                
                utils.notifySocket(io, socketId, itemGuid, 'pending', null, 'Collecting variants from products');
                
                productsPrintFilesResults.forEach(function(productDetails) {
                    if (productDetails) {
                        productDetails.result.printfiles.forEach(printfile => {
                            if (!printfileIds[printfile.printfile_id]) {
                                printfileIds[printfile.printfile_id] = printfile;
                            }
                        });
                        
                        productDetails.result.variant_printfiles.forEach(variant_printfile => {
                            printfileVariants[variant_printfile.variant_id] = variant_printfile;
                        });
                    }
                });    
                return Q.all(productsVariants);
            })
            .then(function(productsVariantsResults){
                productsVariantsResults.forEach((productInvariantsDetails) => {
                    if (productInvariantsDetails) {
                        let additional_price = 0;
                        productInvariantsDetails.result.product.files.forEach(file => {
                            if (file.id === 'label_outside')
                            additional_price = parseFloat(file.additional_price);
                        });
                        
                        productInvariantsDetails.result.variants.forEach(variant => {
                            
                            if (!possibleSizes[variant.size])
                            possibleSizes[variant.size] = true;
                            
                            //get variant
                            let p_var = printfileVariants[variant.id];
                            //get placements
                            let p_placements = p_var.placements;
                            
                            //get front and back label
                            let p_front = p_placements.front;
                            let p_label_outside = p_placements.label_outside;
                            
                            //get front sizes
                            let p_front_size = printfileIds[p_front];
                            variant.front = { width: p_front_size.width, height: p_front_size.height };
                            
                            if(!possibleAspectRatios[`${p_front_size.width}_${p_front_size.height}`])
                            possibleAspectRatios[`${p_front_size.width}_${p_front_size.height}`] = variant.front;
                            
                            //get label_outside sizes
                            if (p_label_outside) {
                                let p_label_outside_size = printfileIds[p_label_outside];
                                variant.label_outside = { width: p_label_outside_size.width, height: p_label_outside_size.height };
                                variant.price = parseFloat(variant.price) + additional_price;
                            }
                            if (!products.hasOwnProperty(variant.product_id))
                            products[variant.product_id] = [];
                            
                            products[variant.product_id].push(variant);
                            productsCalculatedVariants[variant.id] = variant;
                        });
                    }
                });
                
                //let resizeImagesPromises = [];
                
                //resizeImagesPromises.push(utils.resizeImageMax(files['frontPrint_1800_2400'][0].path, 1000, 1333));
                //resizeImagesPromises.push(utils.resizeImageMax(files['frontPrint_1500_1800'][0].path, 1000, 1333));
                //resizeImagesPromises.push(utils.resizeImageMax(files['frontPrint_1500_1500'][0].path, 1000, 1333));
                
                // for (let possibleAspectRatio in possibleAspectRatios) {
                //     if( possibleAspectRatios.hasOwnProperty(possibleAspectRatio) ) {
                //         let aspectRatio = possibleAspectRatios[possibleAspectRatio];
                //         if(aspectRatio.width === aspectRatio.height)
                //         resizeImagesPromises.push(utils.cropImage(files['frontPrint'][0].path, aspectRatio.width));
                //         else
                //         resizeImagesPromises.push(utils.resizeImageMax(files['frontPrint'][0].path, aspectRatio.width, aspectRatio.height));
                //     } 
                // }    
                
                //return Q.all(resizeImagesPromises);
                
            })
            .then(function(resizedImageStreams){
                
                utils.notifySocket(io, socketId, itemGuid, 'pending', null, 'Uploading designs to Blob storage');
                
                let azureTemps = [];
                
                let frontDestination_1800_2400 = `${itemGuid}/front_1800_2400.${files['frontPrint_1800_2400'][0].originalFilename.slice((files['frontPrint_1800_2400'][0].originalFilename.lastIndexOf(".") - 1 >>> 0) + 2)}`;
                azureTemps.push(azureSvc.uploadBlobFromLocalFile(files['frontPrint_1800_2400'][0].path, frontDestination_1800_2400));
                frontDestinations['1800_2400'] = frontDestination_1800_2400;
                
                let frontDestination_1500_1800 = `${itemGuid}/front_1500_1800.${files['frontPrint_1500_1800'][0].originalFilename.slice((files['frontPrint_1500_1800'][0].originalFilename.lastIndexOf(".") - 1 >>> 0) + 2)}`;
                azureTemps.push(azureSvc.uploadBlobFromLocalFile(files['frontPrint_1500_1800'][0].path, frontDestination_1500_1800));
                frontDestinations['1500_1800'] = frontDestination_1500_1800;
                
                let frontDestination_1500_1500 = `${itemGuid}/front_1500_1500.${files['frontPrint_1500_1500'][0].originalFilename.slice((files['frontPrint_1500_1500'][0].originalFilename.lastIndexOf(".") - 1 >>> 0) + 2)}`;
                azureTemps.push(azureSvc.uploadBlobFromLocalFile(files['frontPrint_1500_1500'][0].path, frontDestination_1500_1500));
                frontDestinations['1500_1500'] = frontDestination_1500_1500;
                
                // resizedImageStreams.forEach((resizedImage) => {
                //     let frontDestination = `${itemGuid}/front_${resizedImage.size}.${files['frontPrint'][0].originalFilename.slice((files['frontPrint'][0].originalFilename.lastIndexOf(".") - 1 >>> 0) + 2)}`;
                //     azureTemps.push(azureSvc.uploadBlobFromStream(resizedImage.stream, frontDestination));
                //     frontDestinations[resizedImage.size] = frontDestination;
                // });
                
                return Q.all(azureTemps);
            })
            .then(function(azureTempsResults){
                let generateMockups = [];
                
                for (let product_id in products) {
                    // skip loop if the property is from prototype
                    if (!products.hasOwnProperty(product_id)) continue;
                    let generateMockupResource = 'mockup-generator/create-task/' + product_id;
                    let generateMockupBody = {
                        variant_ids: [],
                        format: 'png',
                        files: []
                    };
                    let firstVariant = true;
                    colors[product_id] = {};
                    let variants = products[product_id];
                    for (let variant in variants) {
                        // skip loop if the property is from prototype
                        if (!variants.hasOwnProperty(variant)) continue;
                        if (firstVariant) {
                            if (variants[variant].front)
                            {
                                var variantSize = `${variants[variant].front.width}_${variants[variant].front.height}`;
                                generateMockupBody.files.push({
                                    "placement": "front",
                                    "image_url": azureConfig.base_url + azureConfig.container + '/' + frontDestinations[variantSize]
                                });
                            }
                            firstVariant = false;
                        }
                        
                        let sanitizedColorCode = variants[variant].color_code.substring(1);
                        
                        if (!colors[product_id][sanitizedColorCode]) {
                            colors[product_id][sanitizedColorCode] = [variants[variant]];
                            generateMockupBody.variant_ids.push(variants[variant].id);
                        }
                        else {
                            colors[product_id][sanitizedColorCode].push(variants[variant])
                        }
                    }
                    
                    generateMockups.push(printfulSvc.post(generateMockupResource, generateMockupBody));
                }
                
                utils.notifySocket(io, socketId, itemGuid, 'pending', null, 'Uploading mockups to Printful');
                return Q.all(generateMockups);
            })
            .then(function(generateMockupsResults){  
                
                var variantsUploadState = {
                    totalVariantsProcessed: 0,
                    totalVariantsUploaded: 0,
                    designRepresentativeSet: false
                };
                
                let mockupGeneratorSubscriptions = [];
                
                generateMockupsResults.forEach((res) => {
                    
                    let mockupGeneratorTaskRetryMechanism = Rx.Observable.defer(function () {
                        return Rx.Observable.fromPromise(printfulSvc.get('mockup-generator/task?task_key=' + res.result.task_key))
                    })
                    .map(function(res) {
                        if(res.result.status === 'pending') {
                            console.log(`${res.result.task_key} is pending`);
                            throw 'ex';
                        }
                        return res.result.mockups;
                    })
                    .retryWhen(function(errors) {
                        return errors.delay(15000);
                    });
                    
                    mockupGeneratorSubscriptions.push(mockupGeneratorTaskRetryMechanism);
                });
                
                var variantsCount = 0;
                
                Rx.Observable.forkJoin(mockupGeneratorSubscriptions)
                .subscribe(t => {
                    
                    utils.notifySocket(io, socketId, itemGuid, 'pending', null, 'Pushing products to SureDone');
                    
                    //first get total variants count
                    t.forEach(mockups => {
                        
                        mockups.forEach(function(mockup) {
                            let firstMockup = mockup;
                            let repVariantId = firstMockup.variant_ids[0];
                            let repVariant = productsCalculatedVariants[repVariantId];
                            let repVariantColor = repVariant.color_code.substring(1);
                            let allVariantsUnderColorCode = colors[repVariant.product_id][repVariantColor];
                            variantsCount += allVariantsUnderColorCode.length;
                        });
                    });
                    
                    variantsUploadState.totalVariants = variantsCount;
                    
                    //then create products in suredone
                    t.forEach(mockups => {
                        
                        //handle first mock as parent
                        let firstMockup = mockups[0];
                        let repVariantId = firstMockup.variant_ids[0];
                        let repVariant = productsCalculatedVariants[repVariantId];
                        let repVariantColor = repVariant.color_code.substring(1);
                        let allVariantsUnderColorCode = colors[repVariant.product_id][repVariantColor];
                        
                        let mockupDestination = `${itemGuid}/${repVariant.product_id}/${repVariantColor}.${firstMockup.mockup_url.slice((firstMockup.mockup_url.lastIndexOf(".") - 1 >>> 0) + 2)}`;
                        let product = productsByKey[repVariant.product_id];
                        
                        azureSvc.uploadBlobFromUrl(firstMockup.mockup_url, mockupDestination)
                        .then(function(x){
                            suredoneSvc.uploadParentToSureDone(io, socketId, variantsUploadState, productsCalculatedVariants, colors, productsByKey, itemGuid, repVariant, repVariantColor, allVariantsUnderColorCode[0], product, mockupDestination, allVariantsUnderColorCode, mockups);
                        });
                    });
                    
                });
                
            })
            .catch(function(err) {
                utils.notifySocket(io, socketId, itemGuid, 'error', null, err);
                console.error(err);
            });
        });
    };
    
    // Display design delete form on GET
    ctrl.design_delete_get = function(req, res) {
        res.send('NOT IMPLEMENTED: Design delete GET');
    };
    
    // Handle design delete on POST
    ctrl.design_delete_post = function(req, res) {
        res.send('NOT IMPLEMENTED: Design delete POST');
    };
    
    // Display design update form on GET
    ctrl.design_update_get = function(req, res) {
        res.send('NOT IMPLEMENTED: Design update GET');
    };
    
    // Handle design update on POST
    ctrl.design_update_post = function(req, res) {
        res.send('NOT IMPLEMENTED: Design update POST');
    };
    
    return ctrl;
};

module.exports = DesignController;

