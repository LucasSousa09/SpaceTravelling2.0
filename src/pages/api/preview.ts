import { linkResolver, getPrismicClient } from '../../services/prismic'
import { setPreviewData, redirectToPreviewURL } from '@prismicio/next'

export default async (req, res) => {
  const client = getPrismicClient({ req })
  await setPreviewData({ req, res })
  await redirectToPreviewURL({ req, res, client, linkResolver })
}