const express = require('express');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

// We are going to implement a JWT middleware that will ensure the validity of our token. We'll require each protected route to have a valid access_token sent in the Authorization header
const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://bigocommerce.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://auth.bigocommerce.com/',
    issuer: "https://bigocommerce.auth0.com/",
    algorithms: ['RS256']
});

//module.exports = router;

module.exports = function(app, wss) {
    
    const router = express.Router();
    const design_controller = require('../controllers/design.controller')(wss);
    
    router.get('/', (req, res) => {

        //console.log(io);

        let formBody = {};
        let itemGuid = '123';
        let repVariant = {product_id: 5};
        let repVariantColor = 'blue';
        let variantsUnderColorCode = {
            id: 37,
            price: '50',
            size:'XL',
            size: 'Blue'
        };
        let product = {
            title: 'title',
            model: 'model',
            description: 'description',
            department: 'department',
            amznitemtype: 'amznitemtype',
            keywords: 'keywords'
        };
        
        formBody['identifier'] = 'guid';
        formBody['guid'] = `${itemGuid}-${repVariant.product_id}-${repVariantColor}-${variantsUnderColorCode.id}`;
        formBody['sku'] = `${itemGuid}-${repVariant.product_id}`;
        formBody['partnumber'] = formBody['guid'];
        formBody['cost'] = variantsUnderColorCode.price;
        formBody['stock'] = '1000';
        formBody['price'] = Math.ceil(parseFloat(variantsUnderColorCode.price) * 1.3).toString();
        formBody['title'] = `${product.title} ${product.model}`;
        formBody['media1'] = `destination`;
        formBody['brand'] = 'DollarScent';
        formBody['description'] = product.description;
        formBody['size'] = variantsUnderColorCode.size;
        formBody['color'] = variantsUnderColorCode.color;
        formBody['colorCode'] = repVariantColor;
        formBody['colormap'] = variantsUnderColorCode.color;
        formBody['department'] = product.department;
        formBody['amznitemtype'] = product.amznitemtype;
        formBody['amzncategory'] = '5';
        formBody['registeredparameter'] = 'PrivateLabel';
        formBody['variationtheme'] = 'sizecolor';
        formBody['condition'] = 'New';
        formBody['variantid'] = variantsUnderColorCode.id;
        formBody['keywords'] = product.keywords;
        
        res.send(formBody);
    });
    
    /// DESIGN ROUTES ///
    
    /* GET request for creating a Design. NOTE This must come before routes that display Design (uses id) */
    router.get('/design/create', jwtCheck, design_controller.design_create_get);
    
    /* POST request for creating Design. */
    router.post('/design/create', jwtCheck, design_controller.design_create_post);
    
    /* GET request to delete Design. */
    router.get('/design/:id/delete', jwtCheck, design_controller.design_delete_get);
    
    // POST request to delete Design
    router.post('/design/:id/delete', jwtCheck, design_controller.design_delete_post);
    
    /* GET request to update Design. */
    router.get('/design/:id/update', jwtCheck, design_controller.design_update_get);
    
    // POST request to update Design
    router.post('/design/:id/update', jwtCheck, design_controller.design_update_post);
    
    /* GET request for one Design. */
    router.get('/design/:id', jwtCheck, design_controller.design_detail);
    
    /* GET request for list of all Design items. */
    router.get('/designs', jwtCheck, design_controller.design_list);
    
    app.use('/api', router);
    
}