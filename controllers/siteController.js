exports.home = (req, res) => {
  res.render('welcome')
}

exports.returnPostJson = (req, res) => {
  console.log(req.body)
  res.json(req.body)
}