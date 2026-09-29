package com.booot.farm_craftmarket.client;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Component
public class CloudService {

    private final Cloudinary cloudinary;
    public CloudService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    public Map upload(MultipartFile file) {

        try {
            return cloudinary.uploader()
                    .upload(
                            file.getBytes(),
                            ObjectUtils.emptyMap()
                    );
        }catch(IOException e){
            throw new BadRequestException("fail with upload file "+e.getMessage());
        }
    }

    public Map delete(String publicId) throws IOException {
        return cloudinary.uploader()
                .destroy(
                        publicId,
                        ObjectUtils.emptyMap()
                );
    }
    }

}
