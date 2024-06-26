import multer from "multer";

/** Initialize the multer middleware to capture file uploads
 * and attach them to req.file
 */
export const upload = multer({
  limits: {
    fileSize: 1000000000, // 1000MB
  },
  rename: (fieldname, filename) => {
    filename.replace(/\W+/g, "-").toLowerCase() + Date.now();
  },
  onFileUploadStart: (file) => {
    console.log(`${file.fieldname}  is starting ...`);
  },
  onFileUploadData: (file, data) => {
    console.log(`${data.length} of ${file.fieldname} arrived`);
  },
  onFileUploadComplete: (file) => {
    console.log(`${file.fieldname} uploaded to ${file.path}`);
  },
});
