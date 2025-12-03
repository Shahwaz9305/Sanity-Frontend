import React from 'react'
interface Props {
  params:{
 slug: string;
  }
 
}

const BlogPage = async ({ params }:  Props) => {
  const {slug} = await params;
  
  return (
    <div>
      <h1>{slug}</h1>
    </div>
  );
}

export default BlogPage;