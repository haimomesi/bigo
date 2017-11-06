const express = require('express');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const azureSvc = require('../services/azureBlob.service');

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
        //azureSvc.listBlobsUnderFolder(req.params.folderGuid);
        res.send('ok');
    });
    
    /// DESIGN ROUTES ///
    
    /* POST request for creating Design. */
    router.post('/design/create', jwtCheck, design_controller.design_create_post);
    
    /* GET request to delete Design. */
    router.get('/design/:id/:socketId/delete', design_controller.design_delete_get);
    
    /* GET request for list of all Design items. */
    router.get('/designs', jwtCheck, design_controller.design_list);
    
    app.use('/api', router);
    
}