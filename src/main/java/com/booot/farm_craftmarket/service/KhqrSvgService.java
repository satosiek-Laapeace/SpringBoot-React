package com.booot.farm_craftmarket.service;

import java.util.Map;
import org.springframework.stereotype.Service;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

@Service
public class KhqrSvgService {
    private static final int IMAGE_SIZE = 320;

    public String render(String qrString) {
        try {
            BitMatrix matrix = new MultiFormatWriter().encode(
                    qrString,
                    BarcodeFormat.QR_CODE,
                    IMAGE_SIZE,
                    IMAGE_SIZE,
                    Map.of(
                            EncodeHintType.CHARACTER_SET, "UTF-8",
                            EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M,
                            EncodeHintType.MARGIN, 2));

            StringBuilder path = new StringBuilder();
            for (int y = 0; y < matrix.getHeight(); y++) {
                for (int x = 0; x < matrix.getWidth(); x++) {
                    if (matrix.get(x, y)) {
                        path.append('M').append(x).append(' ').append(y)
                                .append("h1v1h-1z");
                    }
                }
            }

            return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 "
                    + matrix.getWidth() + " " + matrix.getHeight()
                    + "\" shape-rendering=\"crispEdges\"><rect width=\"100%\" height=\"100%\" fill=\"#fff\"/>"
                    + "<path d=\"" + path + "\" fill=\"#000\"/></svg>";
        } catch (WriterException e) {
            throw new IllegalArgumentException("KHQR payload could not be rendered", e);
        }
    }
}

