import { PortableText } from "next-sanity";
import { client } from "../src/sanity/lib/client";
import { BLOG_QUERY } from "../src/sanity/lib/queries";
import { urlFor } from "@/src/sanity/lib/sanityImageUrl";
import Link from "next/link";

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


export interface Blog {
  _id: string;
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
  title: string;
  metaDesc: string;
  portableText: PortableTextBlock[];
  slug?: {
    current: string;
    _type: "slug";
  };
  blogImage?: SanityImage; 
}

export default async function PostIndex() {
  const blogs: Blog[] = await client.fetch(BLOG_QUERY);
  console.log("blogs", blogs);

  return (
    <div className="blog-index-container">
      <h1>Latest Blog Posts</h1>
      <div className="post-list-grid ">
        {blogs.map((blog) => (
          <div key={blog._id} className="post-card bg-blue-500 shadow-lg shadow-blue-500/50">
            <img className="w-2xl" src={urlFor(blog?.blogImage)?.width(300)?.height(200)?.url()} alt={`${blog?.title} Image`}/>

            <h2 className="post-title">
              {blog.slug?.current ? (
                <Link href={`/${blog.slug.current}`}>{blog.title}</Link>
              ) : (
                blog.title
              )}
            </h2>
            {/* <Image src={blog.blogImage?.asset._ref} alt="kjzkvjzvkcjnzkjc" /> */}
            {/* <p className="post-metadata">
              ID: {blog._id}
              {blog.slug?.current && (
                <span className="slug-display">
                  {" "}
                  | Slug: /{blog.slug.current}
                </span>
              )}
            </p> */}

            <div className="post-content-preview">
              <PortableText value={blog.portableText} />
            </div>

            {/* Read More Link */}
            {blog.slug?.current && (
            <Link href={`/${blog?.slug?.current}`} className="read-more-link ">
              Read Post →
            </Link>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}
