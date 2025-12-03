import {defineQuery} from 'next-sanity'

export const BLOG_BY_SLUG_QUERY = defineQuery(`*[_type == "blog"  && slug.current == $slug][0]`)

export const BLOG_QUERY = defineQuery(`*[_type == "blog"]`)