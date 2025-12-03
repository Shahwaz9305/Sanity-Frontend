// sanityImageUrl.ts
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

import { client } from './client' 

const builder = createImageUrlBuilder(client)
export function urlFor(source: SanityImageSource) {
  console.log("source",source)
  return builder.image(source)
}