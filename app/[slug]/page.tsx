
import { client } from "../../src/sanity/lib/client";
import {BLOG_BY_SLUG_QUERY} from '../../src/sanity/lib/queries'
import { PortableText } from "next-sanity";
import { urlFor } from "@/src/sanity/lib/sanityImageUrl";


interface ImageAsset {
  _ref: string;
  _type: "reference";
}

interface ImageCrop {
  _type: "sanity.imageCrop";
  bottom: number;
  left: number;
  right: number;
  top: number;
}

interface ImageHotspot {
  _type: "sanity.imageHotspot";
  height: number;
  width: number;
  x: number;
  y: number;
}

interface SanityImage {
  _type: "image" | "Image"; 
  asset: ImageAsset;
  caption?: string;
  attribution?: string; 
  crop?: ImageCrop;
  hotspot?: ImageHotspot;
}


interface PortableTextSpan {
  _key: string;
  _type: "span";
  marks: string[]; 
  text: string;
}


export type PortableTextBlock = {
  _key: string;
  _type: "block";
  children: PortableTextSpan[];
  // markDefs: any[]; 
  style: string; 
} | SanityImage; 


interface Props {
  params:{
 slug: string;
  

  }
  _id: string;
    title: string;
  metaDesc: string;
  portableText: PortableTextBlock[];
  blogImage?: SanityImage; 
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  _type: "blog";
  _system?: {
    base: {
      id: string;
      rev: string;
    }
  };
 
}
const BlogPage = async ({ params }:  Props) => {
  const {slug} = await params;
  const blog: Props[] = await client.fetch(BLOG_BY_SLUG_QUERY, { slug });
  const {title,blogImage,portableText}= await blog;
    console.log("blogs by slug", blog);
  return (
    <div>
      <h1 >{title}</h1>
       <div >
            <img className="w-sm" src={urlFor(blogImage)?.width(300)?.height(200)?.url()} alt={`${blog?.title} Image`}/>
            <div className="post-content-preview">
              <PortableText value={portableText} />
            </div>
          </div>
    </div>
  );
}

export default BlogPage;