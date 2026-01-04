import cloudinary from '../config/cloudinary.js';

export const uploadBufferToCloudinary = async (buffer, folder = 'nimbus') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    console.error('Error uploading buffer to Cloudinary:', error);
                    return reject(new Error('Failed to upload image to Cloudinary: ' + error.message));
                }
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};