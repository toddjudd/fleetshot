const jimp = require('jimp');
const uuid = require('uuid');
const multer = require('multer');
const mime = require('mime-types');
const slug = require('slugs');
const fs = require('fs');
const multerOptions = {
  storage: multer.memoryStorage()
}
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, process.env.BOLDIR+'/'+req.params.id);
  },
  filename: function (req, file, callback) {
    const extension = mime.extension(file.mimetype)
    const fileName = slug(file.originalname.split('.')[0])
    const filePath = `${fileName}__${uuid.v4()}.${extension}`
    callback(null, filePath);
  }
})
const multiUpload = multer({ storage : storage }).array('file');

exports.uploadMultiple = (req, res) => {
  multiUpload(req, res, function(err) {
    if (err) {
      req.flash('error', 'Error Uploading Files')
      res.redirect('back')
      return
    } 
    req.flash('success', 'Files Uploaded')
    res.redirect('back')
  })
}

exports.displaySingleFileInputTestForm = (req, res) => {
  res.render('singlefileinput')
}

exports.upload = multer(multerOptions).single('file')

exports.write = (req, res, next) => {
  if (req.file.mimetype.startsWith('image')) {
    return next();
  }
  const extension = req.file.mimetype.split('/')[1]
  const file = `${uuid.v4()}.${extension}`
  fs.writeFile(process.env.BOLDIR+'/'+req.params.id+'/'+file, req.file.buffer, function(err) {
    if (err) {
    }
    res.redirect(`/job/${req.params.slug}`)
    return;
  })
}

exports.resize = async (req, res) => {
  if (!req.file) {
    req.flash('error', 'No File Uploaded')
    res.redirect(`/job/${req.params.slug}`)
    return;
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(process.env.BOLDIR+'/'+req.params.id+'/'+req.body.photo)
  res.redirect(`/addBolPhotos/${req.params.id}`)
}

exports.postSingleFileInputTest = (req, res) => {
  res.json(req.file)
}

//DOES NOT WORK - Limitations due to filesize and jimp blocking in a for each loop
// exports.displayMultiFileInputTestForm = (req, res) => {
//   res.render('multifileinput')
// }

// exports.uploadMultiple = multer(multerOptions).array('files')

// exports.resizeMultiple = async (req, res, next) => {

// }

// exports.postMultiFileInputTest = (req, res) => {
//   res.json(req.files)
// }



