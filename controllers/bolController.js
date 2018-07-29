const mongoose = require('mongoose')
const moment = require('moment')
const Bol = mongoose.model('Bol')
const slug = require('slugs');
const fs = require('fs')
const bsf = require('base64-img')
const mail = require('../handlers/mail.js')
const h = require('./../helpers')

exports.setTypeDelivery = (req, res, next) => {
  req.body.type = 'Delivery'
  req.body.status = 'creating'
  return next();
}

exports.setTypePickup = (req, res, next) => {
  req.body.type = 'Pick Up'
  req.body.status = 'creating'
  return next();
}

exports.newBol = async (req, res) => {
  lastBol = await Bol.aggregate([
    {$group: {
      _id: null,
      id: {$max: "$id"}
    }}
  ])
  if (lastBol.length<=0) {
    req.body.id = 470000000000  
  } else {
    req.body.id = lastBol[0].id+1
  }
  res.render('newbol', {title: 'Create New BOL', bol: req.body || {}})
}

exports.createBolDir = (req, res, next) => {
  req.body.path = process.env.BOLDIR + `/${req.body.id}`
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
  req.body.location.city = req.body.city
  req.body.location.state = req.body.state
  req.body.location.postal = req.body.postal
  //save bol
  const bol = new Bol(req.body)
  const save = await bol.save()
  //show bol
  res.redirect(`/addBolPhotos/${save.id}`)
}

exports.editBol = (req, res) => {
  res.render('newBol', {title: 'Create New BOL', bol: req.body})
}

exports.checkVin = async (req, res, next) => {
  const vin = await Bol.findOne({vin: req.body.vin})
  if (vin){
    req.flash('error', 'Vin has already been used')
    res.render('newbol', {title: 'Create New BOL', bol: req.body || {}, flashes: req.flash()})
    return
  } else {
    return next();
  }
}

exports.addBolPhotos = async (req, res) => {
  const bol = await Bol.findOne({ id: req.params.id })
  bol.photos = await showDir(bol.path)
  bol.photoCount = 0
  bol.photos.forEach(photo => {
    if ( photo != 'custSig.png' && photo != 'driveSig.png' ) {
      bol.photoCount++
    }
  })
  res.render('addPhotoForm', {title: 'Add BOL Photos', bol})
}

exports.addBolSignatures = async (req, res) => {
  const bol = await Bol.findOne({ id: req.params.id }) 
  res.render('addSigForm', {title: 'Add BOL Signatures', bol})
}

exports.saveBolSignatures = async (req, res) => {
  const bol = await Bol.findOne({ id: req.params.id }) 
  bol.custSigURI = req.body.custSig.replace(/ /gi, '+')
  bol.driveSigURI = req.body.driveSig.replace(/ /gi, '+')
  errors = []
  bsf.img(bol.custSigURI, process.env.BOLDIR+'/'+bol.id, 'custSig', function(err, filepath) {
    if (err) {errors.append(err)}
  });
  bsf.img(bol.driveSigURI, process.env.BOLDIR+'/'+bol.id, 'driveSig', function(err, filepath) {
    if (err) {errors.append(err)}
  });
  bol.custSigPath =  '/bols/'+bol.id+'/custSig.png'
  bol.driveSigPath = '/bols/'+bol.id+'/driveSig.png'
  bol.signedDate = moment()
  update = await Bol.update({id:req.params.id}, bol, {upsert:false})
  if (errors.length >0 || update.ok === 0) {
    res.json({status: 500, err: 'Network Error: Please Try Again'})
    return
  }
  res.json({status: 200, msg: `Signatures Added to BOL:${bol.id}`})
}

exports.confirmBol = async (req, res) => {
  const bol = await Bol.findOne({ id: req.params.id })
  bol.photos = await showDir(bol.path)
  res.render('confirmBol', {title: 'Confirm BOL', bol})
}

exports.saveBolConfirmation = async(req, rest, next) => {
  req.bol = await Bol.findOne({ id: req.params.id }) 
  req.bol.photos = await showDir(req.bol.path)
  req.bol.customerEmail = req.body.customerEmail
  req.bol.confirmedDate = moment()
  req.bol.status = 'Completed'
  update = await Bol.update({id:req.params.id}, req.bol, {upsert:false})
  return next();
}

exports.sendCustomerPDF = async (req, res) => {
  req.bol.emailDate = moment(req.bol.confirmedDate).format('HH:MM') + moment(req.bol.confirmedDate).format('YYYY-MM-DD')
  await mail.sendPDF({
    customerEmail: req.bol.customerEmail, 
    subject: `BOL: ${req.bol.id} VIN: ${req.bol.vin}`, 
    filename: 'bol-pdf',
    bol: req.bol,
    h,
    moment
  })
  req.flash('success', `A PDF copy has been emailed ${req.bol.customerName}`)
  res.redirect('/')
}

exports.findBols = async (req, res) => {
  regex = new RegExp(req.body.vin, 'gi')
  bols = await Bol.find({vin: regex, status: {$nin: ['Deleted']}})
  res.render('bols', {title: 'Search for BOL', bols})
}

exports.getBols = async (req, res) => {
  bols = await Bol.find({status: {$nin: ['Deleted']}})
  res.render('bols', {title: 'Search for BOL', bols})
}

exports.getBol = async (req, res) => {
  bol = await Bol.findOne({ id: req.params.id , status: {$nin: ['Deleted']}})
  console.log(bol.path) 
  bol.photos = await showDir(bol.path)
  res.render('bol', {title: `BOL Record`, bol})
}

exports.deleteBolById = async (req, res) => {
  bol = await Bol.update({id: req.params.id}, {status: 'Deleted'})
  res.redirect('/searchBol')
}

function showDir(dir) {
  return new Promise(function(resolve, reject){
    fs.readdir(dir, (err, data) => {
        if (err) { reject(err); }
        resolve(data);
    })
  });
}