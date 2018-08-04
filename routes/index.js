const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const apiController = require('../controllers/apiController');
const authController = require('../controllers/authController');
const siteController = require('../controllers/siteController');
const bolController = require('../controllers/bolController');
const uploadController = require('../controllers/uploadController');
const pdfController = require('../controllers/pdfController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', siteController.home);
//login
router.get('/login', userController.loginForm)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/register', userController.registerForm)
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
)
//bol
router.get('/newPickUp', 
  bolController.setTypePickup,
  catchErrors(bolController.newBol)
)
router.get('/newDelivery', 
  bolController.setTypeDelivery,
  catchErrors(bolController.newBol)
)
router.post('/createBol', 
  bolController.getBolId,
  bolController.createBolDir,
  catchErrors(bolController.createBol)
)
//bol photos
router.get('/addBolPhotos/:id', bolController.addBolPhotos)
router.post('/uploadphoto/:id', 
  uploadController.upload,
  uploadController.write,
  uploadController.resize
)
router.post('/uploadMultiple/:id',
  uploadController.uploadMultiple
)
//bol signatures
router.get('/addBolSig/:id', bolController.addBolSignatures)
router.post('/addBolSig/:id', bolController.saveBolSignatures)
//bol confirmation
router.get('/confirmBol/:id', bolController.confirmBol)
router.post('/confirmBol/:id', 
  bolController.saveBolConfirmation,
  bolController.sendCustomerPDF
  // pdfController.savePDF
)
//search BOLs
router.get('/searchBol', bolController.getBols)
router.post('/searchBol', bolController.findBols)
router.get('/bol/:id', catchErrors(bolController.getBol))
//Delete BOLs
router.get('/delete/bol/:id', bolController.deleteBolById)
//GeoCoding Api
router.get('/api/geocodeing/lat/:lat/lng/:lng', apiController.reverseGeocodeing)
//testing routes
router.post('/json', siteController.returnPostJson)

module.exports = router;