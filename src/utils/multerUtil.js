import multer from "multer";

const getDestination = (req, file, cb) => {
  const fileType = req.body.fileType;

  let folder;
  if (fileType === 'profile') {
    folder = 'profiles';
  } else if (fileType === 'product') {
    folder = 'products';
  } else if (fileType === 'document') {
    folder = 'documents';
  } else {
    return cb(new Error('Tipo de archivo no válido'));
  }

  cb(null, `public/img/${folder}`);
};

const storage = multer.diskStorage({
  destination: getDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

export const uploader = multer({ storage });