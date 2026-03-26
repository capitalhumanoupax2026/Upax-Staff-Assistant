import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Proxy para fotos de Google Drive compartidas públicamente
// Resuelve el problema de CORS desde el browser — el servidor hace el fetch sin restricciones
// GET /api/hrbp-photo?id=FILE_ID
router.get("/hrbp-photo", async (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    res.status(400).json({ error: "Missing or invalid file id" });
    return;
  }

  try {
    // Google Drive direct download URL para archivos compartidos públicamente
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    const driveRes = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UPAX-HR-Bot/1.0)",
        "Accept": "image/*,*/*",
      },
      redirect: "follow",
    });

    if (!driveRes.ok) {
      console.error(`Drive returned ${driveRes.status} for file ${fileId}`);
      res.status(driveRes.status).json({ error: "No se pudo obtener la imagen" });
      return;
    }

    const contentType = driveRes.headers.get("content-type") || "image/jpeg";

    // Si Google devuelve HTML (página de error o login), rechazar
    if (contentType.includes("text/html")) {
      console.warn(`Drive returned HTML for file ${fileId} — el archivo no es público o requiere login`);
      res.status(403).json({ error: "La imagen no es accesible públicamente" });
      return;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const arrayBuffer = await driveRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("hrbp-photo proxy error:", err?.message || err);
    res.status(500).json({ error: "Error al obtener la imagen" });
  }
});

export default router;
