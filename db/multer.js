const multer  = require('multer')
const path = require('path')
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, 'views/uploads/')
	},
	filename: function (req, file, cb) {
	  cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
	}
  })
  
const upload = multer({storage: storage});

module.exports = upload;