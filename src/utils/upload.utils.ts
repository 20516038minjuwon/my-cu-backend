import { bucket } from "../config/firebase";
import path from "path";

export const uploadFileToFirebase = async (
    file: Express.Multer.File,
    folder: string,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(file.originalname);
        const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        const blob = bucket.file(filename);

        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on("error", error => {
            reject(error);
        });

        blobStream.on("finish", async () => {
            try {
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
                resolve(publicUrl);
            } catch (err) {
                reject(err);
            }
        });

        blobStream.end(file.buffer);
    });
};

export const deleteFileFromFirebase = async (publicUrl: string): Promise<void> => {
    try {
        const prefix = `https://storage.googleapis.com/${bucket.name}/`;

        if (!publicUrl.startsWith(prefix)) {
            console.warn(`[Firebase Delete] 외부 URL이거나 형식이 다릅니다: ${publicUrl}`);
            return;
        }

        const filePath = decodeURIComponent(publicUrl.replace(prefix, ""));

        const file = bucket.file(filePath);

        const [exists] = await file.exists();
        if (exists) {
            await file.delete();
            console.log(`[Firebase Delete] 파일 삭제 성공: ${filePath}`);
        } else {
            console.warn(`[Firebase Delete] 파일이 존재하지 않습니다: ${filePath}`);
        }
    } catch (error) {
        console.error(`[Firebase Delete] 파일 삭제 실패:`, error);
    }
};
