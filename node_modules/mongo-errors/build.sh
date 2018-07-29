# Download error codes from github and convert to JS code
curl https://raw.githubusercontent.com/mongodb/mongo/master/src/mongo/base/error_codes.err |
grep -v 'mode: python' |
gsed 's/#/\/\//' |
gsed '1i exports.class = {};' |
gsed 's/error_code("\(\w*\)", \([0-9]*\) *)/exports.\1 = \2;/' |
gsed 's/;;$/;/' |
gsed 's/"\(\w*\)"/exports.\1/g' |
gsed 's/error_class(exports\.\(\w*\),/exports.class.\1 =/' |
gsed 's/])$/];/g' > index.js
