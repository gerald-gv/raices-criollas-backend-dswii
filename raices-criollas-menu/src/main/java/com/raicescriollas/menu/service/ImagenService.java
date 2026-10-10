package com.raicescriollas.menu.service;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Iterator;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import org.apache.tika.Tika;

@Service
public class ImagenService {

    private final Cloudinary cloudinary;

    private final Tika tika = new Tika();

    private static final long TAMANO_MAXIMO = 5L * 1024 * 1024;

    private static final long PIXELES_MAXIMOS = 25_000_000L;

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/jpeg",
            "image/png"
    );

    public ImagenService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    private void validarImagen(byte[] contenido) throws IOException {
        String tipoReal = tika.detect(contenido);
        if (!TIPOS_PERMITIDOS.contains(tipoReal)) {
            throw new IllegalArgumentException(
                    "Solo se permiten imágenes JPEG o PNG válidas");
        }

        try (ImageInputStream entrada = ImageIO.createImageInputStream(
                new ByteArrayInputStream(contenido))) {
            if (entrada == null) {
                throw new IllegalArgumentException(
                        "No se pudo leer el archivo de imagen");
            }
            Iterator<ImageReader> lectores = ImageIO.getImageReaders(entrada);
            if (!lectores.hasNext()) {
                throw new IllegalArgumentException(
                        "El archivo no es una imagen compatible");
            }
            ImageReader lector = lectores.next();
            try {
                lector.setInput(entrada, true, true);
                int ancho = lector.getWidth(0);
                int alto = lector.getHeight(0);

                if (ancho <= 0 || alto <= 0
                        || (long) ancho * alto > PIXELES_MAXIMOS) {
                    throw new IllegalArgumentException(
                            "La imagen tiene dimensiones no permitidas");
                }
                BufferedImage imagen = lector.read(0);
                if (imagen == null) {
                    throw new IllegalArgumentException(
                            "La imagen está dañada o no se puede leer");
                }

            } finally {
                lector.dispose();
            }

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (IOException | RuntimeException e) {
            throw new IllegalArgumentException(
                    "El archivo no es una imagen válida o está dañado");
        }
    }
    public String subirImagen(MultipartFile archivo) throws IOException {

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes seleccionar una imagen");
        }

        // Validar el tamaño antes de leer el archivo completo
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException(
                    "La imagen no debe superar los 5 MB");
        }

        byte[] contenido = archivo.getBytes();

        // Validar el contenido real, no el MIME enviado por Postman
        validarImagen(contenido);

        // Subir únicamente después de superar las validaciones
        Map<?, ?> resultado = cloudinary.uploader().upload(
                contenido,
                ObjectUtils.asMap(
                        "folder", "raices-criollas/platos",
                        "resource_type", "image"
                )
        );

        Object url = resultado.get("secure_url");

        if (url == null) {
            throw new IOException(
                    "Cloudinary no devolvió la URL de la imagen");
        }

        return url.toString();
    }

    /**
     * Elimina una imagen de Cloudinary a partir de su secure_url.
     * Si la URL es nula o vacía, no hace nada.
     * Los errores se loguean pero no interrumpen el flujo principal.
     */
    public void eliminarImagen(String urlImagen) {
        if (urlImagen == null || urlImagen.isBlank()) return;
        try {
            // Extraer el public_id desde la URL: "raices-criollas/platos/<nombre>"
            String publicId = extraerPublicId(urlImagen);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // No lanzar excepcion: la imagen huerfana es menos grave que interrumpir la operacion
        }
    }

    private String extraerPublicId(String url) {
        // secure_url tiene la forma: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<nombre>.<ext>
        int uploadIdx = url.indexOf("/upload/");
        if (uploadIdx == -1) return null;
        String resto = url.substring(uploadIdx + 8); // quitar "/upload/"
        // quitar version opcional (v1234567890/)
        if (resto.startsWith("v") && resto.contains("/")) {
            resto = resto.substring(resto.indexOf("/") + 1);
        }
        // quitar extension
        int puntoIdx = resto.lastIndexOf(".");
        return puntoIdx != -1 ? resto.substring(0, puntoIdx) : resto;
    }
}