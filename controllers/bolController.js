const mongoose = require('mongoose')
const moment = require('moment')
const Bol = mongoose.model('Bol')
const slug = require('slugs');
const fs = require('fs')
const bsf = require('base64-img')

exports.newBol = (req, res) => {
  res.render('newbol', {title: 'Create New BOL', bol: req.body || {}})
}

exports.createBolDir = (req, res, next) => {
  req.body.path = process.env.BOLDIR + `/${slug(req.body.vin)}`
  if (!fs.existsSync(req.body.path)) {
    fs.mkdirSync(req.body.path);
    console.log('creating New Directory');
  }
  return next();
}

exports.createBol = async (req, res, next) => {
  //pop location
  req.body.location = {}
  req.body.location.coordinates = req.body.coordinates
  req.body.location.googleAddress = req.body.googleAddress
  req.body.location.address = req.body.address
  //save bol
  const bol = new Bol(req.body)
  const save = await bol.save()
  //show bol
  res.redirect(`/addBolPhotos/${save.vin}`)
}

exports.editBol = (req, res) => {
  res.render('newBol', {title: 'Create New BOL', bol: req.body})
}

exports.addBolPhotos = async (req, res) => {
  const bol = await Bol.findOne({ vin: req.params.vin })
  res.render('addPhotoForm', {title: 'Add BOL Photos', bol})
}

exports.addBolSignatures = async (req, res) => {
  const bol = await Bol.findOne({ vin: req.params.vin }) 
  res.render('addSigForm', {title: 'Add BOL Signatures', bol})
}

exports.saveBolSignatures = async (req, res) => {
  const bol = await Bol.findOne({ vin: req.params.vin }) 
  bol.custSigURI = req.body.custSig.replace(/ /gi, '+')
  bol.driveSigURI = req.body.driveSig.replace(/ /gi, '+')
  errors = []
  bsf.img(bol.custSigURI, process.env.BOLDIR+'/'+bol.vin, 'custSig', function(err, filepath) {
    if (err) {errors.append(err)}
  });
  bsf.img(bol.driveSigURI, process.env.BOLDIR+'/'+bol.vin, 'driveSig', function(err, filepath) {
    if (err) {errors.append(err)}
  });
  bol.custSigPath =  '/bols/'+bol.vin+'/custSig.png'
  bol.driveSigPath = '/bols/'+bol.vin+'/driveSig.png'
  bol.signedDate = moment()
  update = await Bol.update({vin:req.params.vin}, bol, {upsert:false})
  if (errors.length >0 || update.ok === 0) {
    res.json({status: 500, err: 'Network Error: Please Try Again'})
    return
  }
  res.json({status: 200, msg: `Signatures Added to VIN:${bol.vin}`})
}

exports.confirmBol = async (req, res) => {
  const bol = await Bol.findOne({ vin: req.params.vin })

  bol.photos = await showDir(bol.path)
  console.log(bol.photos)

  res.render('confirmBol', {title: 'Confirm BOL', bol})
}

exports.updateCustomerInfo = (req, res) => {
  
}

exports.saveBolConfirmation = (req, res) => {
  
}

exports.findBol = (req, res) => {
  res.send('working on it')
}

function showDir(dir) {
  return new Promise(function(resolve, reject){
    fs.readdir(dir, (err, data) => {
        if (err) { reject(err); }
        resolve(data);
    })
  });
}