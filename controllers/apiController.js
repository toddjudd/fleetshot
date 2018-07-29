const moment = require('moment')
const request = require("request")
const h = require('./../helpers')

exports.reverseGeocodeing = (req, res) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.params.lat},${req.params.lng}&key=${process.env.MAP_KEY}`
  let postal
  let state
  let city
  request(url, function (err, response, body) {
    json = JSON.parse(body)
    if (err) {
      res.json({err:'Something went wrong'})
    }
    if (!json.results[0]) {
      res.json({err:'No results'})
    }
    json.results[0].address_components.forEach(comp => {
      if (comp.types.includes('postal_code')) {
        postal = comp.long_name
      }
      if (comp.types.includes('administrative_area_level_1')) {
        state = comp.short_name
      }
      if (comp.types.includes('locality')) {
        city = comp.long_name
      }
    })
    res.json({postal: postal, state: state, city: city, status: 200})
  })  
}