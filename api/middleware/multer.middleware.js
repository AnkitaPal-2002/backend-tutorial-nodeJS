const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(req.files['avatar'][0]);
      
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + file.originalname)
    }
});
  
const upload = multer({ storage })

module.exports = upload;