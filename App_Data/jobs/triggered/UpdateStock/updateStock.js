const rp = require('request-promise');
const requestretry = require('requestretry');
const Rx = require('rxjs/Rx');
const csv = require('csv');
const Q = require('q');

require('rxjs/add/operator/retryWhen');
require('rxjs/add/operator/delayWhen');
require('rxjs/add/operator/catch');
require('rxjs/add/observable/timer');
require('rxjs/add/observable/fromPromise');

const config = {
    printful: {
        API_path: "api.printful.com",	
        API_access : "jj2x8phv-gtwx-80xf:1gib-kxuxg0hvjc6f"
    },
    suredone: {
        API_path: "api.suredone.com",
        API_user: "benomesi",
        API_access: "4C0E5203BF651005DF45581B491D276566290D54177CCECAEC32C54B82D5AAAFC18A2DADB753E3B11LXIVFENOBAUFKXI5FTSXE3RB5F"
    }
};

const printfulHeaders = {
    'Authorization': 'Basic ' + Buffer.from(config.printful.API_access).toString('base64'),
    'Content-Type': 'text/plain',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'User-Agent': 'Request-Promise'
};

const suredoneHeaders = {
    'content-type': 'application/x-www-form-urlencoded',
    'x-auth-user': 'benomesi',
    'x-auth-token': '4C0E5203BF651005DF45581B491D276566290D54177CCECAEC32C54B82D5AAAFC18A2DADB753E3B11LXIVFENOBAUFKXI5FTSXE3RB5F'
};

let getFromPrintful = function(endpoint){
    
    var options = {
        method: 'GET',
        url: 'https://' + config.printful.API_path + '/' + endpoint,
        headers: printfulHeaders,
        json: true
    };
    
    //send request
    return rp(options);
}

let bulk_get = function(endpoint) {
    
    var options = {
        method: 'GET',
        url: 'https://' + config.suredone.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        fullResponse: false,
        json: true
    };
    
    return requestretry(options);
}

let bulk_post = function(endpoint, body) {
    
    var options = {
        method: 'POST',
        url: 'https://' + config.suredone.API_path + '/v1/' + endpoint,
        headers: suredoneHeaders,
        body: body,
        json: true,
        fullResponse: false
    };
    
    return requestretry(options);
}

let containsWord = function(product){
    var blackListWords = ['Toddler', 'Infant', 'Baby', 'Kid', 'Youth'];
    var foundWord = false;
    
    for(var j = 0 ; j < blackListWords.length ; j++){
        if (product.model.indexOf(blackListWords[j]) != -1) {
            foundWord = true;
        }
    }
    return foundWord;
}

let productsVariants = [],
variants = {};

getFromPrintful('products')
.then(function(productsResponse){
    let bellaProducts = productsResponse.result.filter((prod) => {
        if(prod.brand == "Bella + Canvas" && prod.type === 'T-SHIRT' && !prod.dimensions && prod.variant_count > 1 && !containsWord(prod))
        {
            productsVariants.push(getFromPrintful('products/' + prod.id));
            return true;
        }
        return false;
    });
    
    return Q.all(productsVariants);
})
.then(function(productsVariantsResults){
    
    productsVariantsResults.forEach((productInvariantsDetails) => {
        if (productInvariantsDetails) {
            
            productInvariantsDetails.result.variants.forEach(variant => {
                let minimalVariant = {
                    newCost: variant.price,
                    newPrice: Math.ceil(parseFloat(variant.price) * 1.3).toString() + ".00",
                    newStock: variant.in_stock ? '1000' : '0'
                }
                variants[variant.id] = minimalVariant;
            });
        }
    });
    
    let bulkBody = `q=variantid:>0&type=items&mode=include&fields=action,guid,variantid,stock,price,cost`;
    
    bulk_post('bulk/exports', bulkBody)
    .then(function(response){
        
        if(response.result != 'success' || response.actions == 0)
        {
            return false;
        }
        
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
            return errors.delay(30000);
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
                    row[0] = index == 0 ? 'action=edit' : 'edit';
                    if(index == 0)
                    {
                        bulkArray.push(row);
                    }
                    if(index > 0)
                    {
                        let variantid = row[2];
                        let currentVariant = variants[variantid];
                        if(row[3] != currentVariant.newStock || row[4] != currentVariant.newPrice || row[5] != currentVariant.newCost){
                            row[3] = currentVariant.newStock; //stock
                            row[4] = currentVariant.newPrice; //price
                            row[5] = currentVariant.newCost; //cost
                            bulkArray.push(row);
                        }
                    }
                });
                
                if(bulkArray.length > 1)
                {
                    //console.log(bulkArray);
                    console.log(`Changes made: ${bulkArray.length}`);
                    
                    bulkBody += JSON.stringify(bulkArray);
                    
                    bulk_post('editor/items', bulkBody)
                    .then(function(response){
                        console.log(`${response.result} ${response.message}`);
                    })
                    .catch(function(err){
                        console.error(err);
                    });
                }
                else{
                    console.log('Changes made: 0');
                }
                
            }));
        });
    })
    .catch(function(err){
        console.error(err);
    });
})