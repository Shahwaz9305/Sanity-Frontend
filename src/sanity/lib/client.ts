import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId,token} from '../env'

export const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion, 
  useCdn: false,
})