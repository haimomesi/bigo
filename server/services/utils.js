//const sharp = require('sharp');
//const Duplex = require('stream').Duplex; 
//const Q = require('q');
//const fs = require('fs');
const ws = require('ws');

// function bufferToStream(buffer) {  
//     let stream = new Duplex();
//     stream.push(buffer);
//     stream.push(null);
//     return stream;
// }

// exports.cropImage = function(pathToFile, size){
    
//     var deferred = Q.defer();
    
//     sharp(pathToFile)
//     .resize(size, size)
//     .crop(sharp.strategy.entropy)
//     .toBuffer()
//     .then( buf => {
//         deferred.resolve({
//             stream: bufferToStream(buf),
//             size: `${size}_${size}`
//         });
//     })
//     .catch( err => {
//         deferred.reject(new Error(err));
//     });
    
//     return deferred.promise;
// }

// exports.resizeImageMax = function(pathToFile, width, height){
    
//     var deferred = Q.defer();
    
//     sharp(pathToFile)
//     .resize(width, height)
//     .max()
//     .toBuffer()
//     .then( buf => {
//         deferred.resolve({
//             stream: bufferToStream(buf),
//             size: `${width}_${height}`
//         });
//     })
//     .catch( err => {
//         deferred.reject(new Error(err));
//     });
    
//     return deferred.promise;
// }

// exports.resizeImage = function(pathToFile, width, height){
    
//     var deferred = Q.defer();
    
//     sharp(pathToFile)
//     .resize(width, height)
//     .toBuffer()
//     .then( buf => {
//         deferred.resolve({
//             stream: bufferToStream(buf),
//             size: `${width}_${height}`
//         });
//     })
//     .catch( err => {
//         deferred.reject(new Error(err));
//     });
    
//     return deferred.promise;
// }

exports.containsWord = function(product){
    var blackListWords = ['Toddler', 'Infant', 'Baby', 'Kid', 'Youth'];
    var foundWord = false;
    
    for(var j = 0 ; j < blackListWords.length ; j++){
        if (product.model.indexOf(blackListWords[j]) != -1) {
            foundWord = true;
        }
    }
    return foundWord;
}

exports.setExtraFields = function(product, fields) {
    var womensListWords = ['Womens', 'Ladies'];
    product.department = 'mens';
    product.amznitemtype = 1045624;
    product.title = fields.title[0];
    product.keywords = fields.keywords[0];
    womensListWords.forEach(word => {
        if (product.model.indexOf(word) != -1) {
            product.department = 'womens';
            product.amznitemtype = 9056923011;
        }
    });
    
    var splittedDescription = product.description.split('•');
    product.description = splittedDescription[0].trim();
    
    for (var index = 1; index < splittedDescription.length; index++) {
        product['bulletpoint' + index] = splittedDescription[index].trim();
    }
}

exports.getColorMap = function(printfulColor) {
    var amznColor = '';
    
    switch (printfulColor) {
        case 'White':
        amznColor = 'White';
        break;
        case 'Black':
        case 'Solid Black Triblend':
        case 'Black Heather':
        case 'Charcoal-Black Triblend':
        case 'Charcoal-black Triblend':
        amznColor = 'Black';
        break;
        case 'Teal Triblend':
        case 'Heather Deep Teal':
        amznColor = 'Turquoise';
        break;
        case 'Navy':
        case 'Steel Blue':
        case 'True Royal':
        case 'True Royal Triblend':
        case 'Heather True Royal':
        case 'Blue Triblend':
        case 'Aqua':
        case 'Aqua Triblend':
        case 'Heather Blue':
        case 'Light Blue':
        case 'Navy Triblend':
        case 'Ocean Blue':
        case 'Heather Midnight Navy':
        case 'Baby Blue':
        amznColor = 'Blue';
        break;
        case 'Forest':
        case 'Heather Forest':
        case 'Green Triblend':
        case 'Kelly':
        case 'Heather Mint':
        case 'Olive':
        case 'Emerald Triblend':
        case 'Leaf':
        amznColor = 'Green';
        break;
        case 'Solid Dark Grey Triblend':
        case 'Dark Grey Heather':
        case 'Deep Heather':
        case 'Grey Triblend':
        case 'Asphalt':
        case 'Athletic Heather':
        case 'White Fleck Triblend':
        case 'Ash':
        case 'Athletic Grey Triblend':
        amznColor = 'Grey';
        break;
        case 'Brown':
        case 'Brown Triblend':
        case 'Clay Triblend':
        case 'Maroon Triblend':
        case 'Army':
        amznColor = 'Brown';
        break;
        case 'Purple Triblend':
        amznColor = 'Purple';
        break;
        case 'Red':
        case 'Red Triblend':
        amznColor = 'Red';
        break;
        case 'Oatmeal Triblend':
        amznColor = 'Off - White';
        break;
        case 'Heather Orange':
        case 'Orange Triblend':
        amznColor = 'Orange';
        break;
        case 'Soft Cream':
        amznColor = 'Beige';
        break;
        case 'White/ Navy':
        case 'White/ Black':
        case 'White/ Canvas Red':
        amznColor = 'Multicoloured';
        break;
        case 'Pink':
        case 'Heather Raspberry':
        case 'Berry Triblend':
        case 'Berry':
        amznColor = 'Pink';
        break;
        case 'Gold':
        amznColor = 'Gold';
        break;
        case 'Yellow':
        amznColor = 'Yellow';
        break;
        case 'Silver':
        amznColor = 'Silver';
        break;
        default:
        break;
    }
    
    return amznColor;
};

exports.getSizeMap = function(printfulSize) {
    let amznSize = '';
    
    switch (printfulSize) {
        case 'XS':
        amznSize = 'X-Small';
        break;
        case 'S':
        case 'XS/SM':
        amznSize = 'Small';
        break;
        case 'M':
        case 'M/L':
        amznSize = 'Medium';
        break;
        case 'L':
        amznSize = 'Large';
        break;
        case 'XL':
        amznSize = 'X-Large';
        break;
        case '2XL':
        amznSize = 'XX-Large';
        break;
        case '3XL':
        amznSize = 'XXX-Large';
        break;
        case '4XL':
        amznSize = 'XXXX-Large';
        break;
        default:
        break;
    }
    
    return amznSize;
}

exports.notifySocket = function(wss, socketId, guid, status, notificationObj, message){
    
    wss.clients.forEach(function each(client) {
        if (client.socketId === socketId && client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
                guid: guid,
                totalVariants: notificationObj && notificationObj.hasOwnProperty('totalVariants') ? notificationObj.totalVariants : 0,
                totalVariantsUploaded: notificationObj && notificationObj.hasOwnProperty('totalVariantsUploaded') ? notificationObj.totalVariantsUploaded : 0,
                action: notificationObj && notificationObj.hasOwnProperty('action') ? notificationObj.action : 'add',
                status: status,
                message: message
            }));
        }
    });

    // if(io.sockets.connected[socketId]!=null) {
    
    //     var notification = {
    //         guid: guid,
    //         totalVariants: notificationObj ? notificationObj.totalVariants : 0,
    //         totalVariantsUploaded: notificationObj ? notificationObj.totalVariantsUploaded : 0,
    //         status: status,
    //         message: message
    //     };
    
    //     console.log(notification);
    //     io.sockets.connected[socketId].emit('notification', notification);
    // }
}