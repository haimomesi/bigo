
const printfulConfig = require('../config/config').printful;
const rp = require('request-promise');

const printfulHeaders = {
    'Authorization': 'Basic ' + Buffer.from(printfulConfig.API_access).toString('base64'),
    'Content-Type': 'text/plain',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'User-Agent': 'Request-Promise'
};

exports.get = function(endpoint){

    var options = {
        method: 'GET',
        url: 'https://' + printfulConfig.API_path + '/' + endpoint,
        headers: printfulHeaders,
        json: true
    };

    //send request
    return rp(options);
};

exports.post = function(endpoint, body){
        
    var options = {
        method: 'POST',
        url: 'https://' + printfulConfig.API_path + '/' + endpoint,
        headers: printfulHeaders,
        json: body
    };

    //send request
    return rp(options);
};