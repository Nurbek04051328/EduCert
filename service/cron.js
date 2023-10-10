const fs = require('fs');
const path = require('path');



const directoryPath = '/path/to/your/files';

// Define a function to delete unnecessary files/images
function deleteFiles() {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);

            // Add conditions here to determine if a file should be deleted
            // For example, you can check file extensions or other criteria

            // Delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log(`Deleted file: ${filePath}`);
                }
            });
        });
    });
}
