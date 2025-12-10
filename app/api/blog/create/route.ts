// app/api/blog/create/route.ts

import { client } from '@/src/sanity/lib/client';
import { NextRequest, NextResponse } from 'next/server';




export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming request as FormData (required for file uploads)
    const formData = await req.formData();
    
    // Extract text fields
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const metaDesc = formData.get('metaDesc') as string;
    const portableTextJson = formData.get('portableText') as string;
    
    // Extract the file
    const imageFile = formData.get('blogImageFile') as File | null;

    // Basic Validation
    if (!title || !slug || !portableTextJson || !imageFile) {
      return NextResponse.json(
        { message: 'Missing required fields: title, slug, content, or image.' }, 
        { status: 400 }
      );
    }

    // 2. Upload the image file to Sanity Assets
    let assetRef = null;
    
    // Convert File object to Buffer for Sanity upload
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("buffer",buffer)
    try {
    
        const assetDocument = await client.assets.upload('image', buffer, {
            filename: imageFile.name,
            contentType: imageFile.type,
        });
        console.log("assetDocument",assetDocument)
        assetRef = assetDocument._id; // This is the ID we need to reference the image
        
    } catch (uploadError) {
        console.error('Sanity Asset Upload Error:', uploadError);
        return NextResponse.json(
            { message: 'Failed to upload image asset.' }, 
            { status: 500 }
        );
    }

    // 3. Prepare the final document structure
    const newBlogDocument = {
      _type: 'blog',
      title: title,
      metaDesc: metaDesc,
      portableText: JSON.parse(portableTextJson), // Parse the stringified JSON content
      slug: {
        _type: 'slug',
        current: slug, 
      },
      blogImage: {
          _type: 'image',
          asset: {
              _type: 'reference',
              _ref: assetRef, // Reference the uploaded image asset
          }
      }
    };

    // 4. Create the document in Sanity
    const response = await client.create(newBlogDocument);

    // 5. Return success response
    return NextResponse.json(
      { 
        message: 'Blog created successfully', 
        id: response._id 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('General Server Error:', error);
    
    // 6. Return error response
    return NextResponse.json(
      { 
        message: 'Failed to create blog post due to internal server error.', 
        error: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
}