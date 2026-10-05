package com.booot.farm_craftmarket.configuration;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Component
public class CloudService {

    private static final String DEFAULT_FOLDER = "farm_craftmarket";
    private static final String ICON_FOLDER = "farm_craftmarket/categories";

    private final Cloudinary cloudinary;

    public CloudService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<?, ?> upload(MultipartFile file) {
        return upload(file, DEFAULT_FOLDER);
    }

    public Map<?, ?> upload(MultipartFile file, String folder) {
        try {
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image"));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not upload the image, please try again", e);
        }
    }

    public Map<?, ?> uploadIcon(MultipartFile icon) {
        return upload(icon, ICON_FOLDER);
    }

    public Map<?, ?> delete(String publicId) {
        try {
            return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not delete the image", e);
        }
    }
}