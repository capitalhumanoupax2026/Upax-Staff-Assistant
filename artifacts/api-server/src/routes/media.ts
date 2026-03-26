import { Router, type IRouter } from "express";
import { getAccessToken } from "../lib/google-sheets.js";

const router: IRouter = Router();

// Proxy autenticado para fotos de Google Drive
// GET /api/hrbp-photo?id=FILE_ID
router.get("/hrbp-photo", async (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    res.status(400).json({ error: "Missing or invalid file id" });
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!driveRes.ok) {
      res.status(driveRes.status).json({ error: "No se pudo obtener la imagen de Drive" });
      return;
    }

    const contentType = driveRes.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    const arrayBuffer = await driveRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("hrbp-photo proxy error:", err);
    res.status(500).json({ error: "Error interno al obtener foto" });
  }
});

export default router;
