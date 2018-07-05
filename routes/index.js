const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
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
router.get('/newBol', bolController.newBol)
router.post('/createBol', 
  bolController.createBolDir,
  catchErrors(bolController.checkVin),
  catchErrors(bolController.createBol)
)
//bol photos
router.get('/addBolPhotos/:vin', bolController.addBolPhotos)
router.post('/uploadphoto/:vin', 
  uploadController.upload,
  uploadController.write,
  uploadController.resize
)
router.post('/uploadMultiple/:vin',
  uploadController.uploadMultiple
)
//bol signatures
router.get('/addBolSig/:vin', bolController.addBolSignatures)
router.post('/addBolSig/:vin', bolController.saveBolSignatures)
//bol confirmation
router.get('/confirmBol/:vin', bolController.confirmBol)
router.post('/confirmBol/:vin', 
  bolController.saveBolConfirmation,
  bolController.sendCustomerPDF
  // pdfController.savePDF
)
//search BOLs
router.post('/searchBol', bolController.findBols)
router.get('/bol/:vin', bolController.getBol)
//testing routes
router.post('/json', siteController.returnPostJson)

module.exports = router;