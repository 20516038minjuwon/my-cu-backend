import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middlewares/upload.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { deleteUploadSchema } from "../schemas/upload.schema";
import { uploadFileToFirebase, deleteFileFromFirebase } from "../utils/upload.utils";
import { HttpException } from "../utils/exception.utils";
import "../schemas/upload.schema";

const router = Router();

router.use(authenticateJwt);

router.post("/", upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        if (!file) {
            throw new HttpException(400, "파일이 전송되지 않았습니다.");
        }

        const folderName = req.body.folder || "uploads";

        const url = await uploadFileToFirebase(file, folderName);

        res.status(201).json({ url });
    } catch (error) {
        next(error);
    }
});

router.delete(
    "/",
    validateBody(deleteUploadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { url } = req.body;

            await deleteFileFromFirebase(url);

            res.status(200).json({ message: "파일이 삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
