const path = require('path')
const fsPromises = require('fs').promises

const publicPath = `./public`

// Excluded paths from page listing as they're redirected to the page with the language and db selected
// https://github.com/prisma/homepage-v8/blob/b972182ebee2c824e6b2981088907b215d9bfee0/public/_redirects#L75-L78
const excludedPaths = [
  '/getting-started/quickstart',
  '/getting-started/setup-prisma/add-to-existing-project',
  '/getting-started/setup-prisma/start-from-scratch-sql ',
  '/getting-started/setup-prisma/start-from-scratch-prisma-migrate',
]

exports.onPostBuild = async ({ graphql, pathPrefix, basePath = pathPrefix }, pluginOptions) => {
  const outputFile = path.join(publicPath, '/lost-pixel.json')

  const query = `
    {
      allSitePage {
        edges {
          node {
            path
          }
        }
      }  
  }`
  const { data } = await graphql(query)

  // Construct the pages json by iterating over the mdx files.
  const pages = data.allSitePage.edges
    .map((edge, i) => {
      // Skip explicitly excluded paths
      if (excludedPaths.includes(edge.node.path)) return null

      console.log({ path: edge.node.path })

      return {
        path: edge.node.path,
        name: edge.node.path.replaceAll('/', '-'),
      }
    })
    .filter((edge) => edge !== null)

  await fsPromises.writeFile(outputFile, JSON.stringify(pages))
}
