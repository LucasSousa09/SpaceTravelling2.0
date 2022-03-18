import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next'

export function linkResolver(doc): string {
  if(doc.type === 'posts'){
    return `/post/${doc.uid}`
  }
  return '/'
}

export function getPrismicClient(config?) {
  const client = prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });

  enableAutoPreviews({
    client,
    previewData: config?.previewData,
    req: config?.req
  })

  return client;
}


