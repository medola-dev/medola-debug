import { NextResponse, NextRequest } from "next/server";
import { Storage } from "@google-cloud/storage";

interface UploadImageRequest {
  imageData: string;
  fileName: string;
}

export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest) => {

    /* This is where the problem arises. Reading from process.env always undefined
    *  This is running on the server and I expect it to pick up the environment variable
    *  that is already set on vercel project dashboard
    *
    */

    console.log(`CREDS  is ${process.env.GOOGLE_APPLICATION_CREDS}`);
    console.log(`Logging env:`);
    console.log(`${JSON.stringify(process.env)}`);
    
    let credentials: any;

    //const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDS!, "base64").toString("utf-8"));
    
    console.log(`Successfully parsed creds form env variable. project id: ${credentials.project_id}`);
    let storage: any;
    
    // const storage = new Storage({
    //   projectId: credentials.project_id,
    //   credentials: {
    //     client_email: credentials.client_email,
    //     private_key: credentials.private_key
    //   },
    // });

    const bucketName = process.env.GOOGLE_APPLICATION_BLOG_IMAGE_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);

    try {
        const body = (await req.json()) as UploadImageRequest;

        if (!body.imageData || !body.fileName) {
        return NextResponse.json({ error: "Missing imageData or fileName" }, { status: 400 }); // Return 400 for bad request
        }

        let fileName = body.fileName;
        const imageData = body.imageData.split(',')[1]; // Remove data URI prefix;
        const imageBinaryData = Buffer.from(imageData, 'base64');
        
        await bucket.file(fileName).save(imageBinaryData, {
            metadata: {
            contentType: "image/jpeg"
            },
        });
        
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        return NextResponse.json({ imageUrl: publicUrl }, { status: 200 });
    } catch (err) {
        console.error(`Error: Failed to upload image: ${err}`);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
};