import path from 'node:path'
import Link from 'next/link'
import { Suspense } from 'react'
import fs from 'node:fs/promises'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'

import rehypeSlug from 'rehype-slug'
import rehypePrettyCode, { type Options } from 'rehype-pretty-code'

import { Grid } from '@/components/Grid'
import { Spacer } from '@/components/Spacer'

async function readPage(slug: string[]) {
  try {
    const filePath = path.join(process.cwd(), 'app', ...slug) + '.md'
    const page = await fs.readFile(filePath, 'utf8')

    const vercelTheme = await import('./vercel-theme.json')
    const rehypePrettyCodeOptions: Options = {
      theme: vercelTheme as any
    }

    type Frontmatter = {
      title: string
      description: string
      published: boolean
      og_image?: string
    }

    const { content, frontmatter } = await compileMDX<Frontmatter>({
      source: page,
      components: { Grid, Link, Spacer },
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          rehypePlugins: [
            [rehypePrettyCode as any, rehypePrettyCodeOptions],
            rehypeSlug
          ]
        }
      }
    })
    return { content, frontmatter }
  } catch (error) {
    notFound()
  }
}

export async function generateMetadata(
  { params }:
  { params: { slug: string[] } }
) {
  const { frontmatter } = await readPage(params.slug)
  const metadata: Metadata = {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      siteName: "compsigh",
    }
  }

  // TODO: dynamic OG generation
  /*
  metadata.openGraph!.images = [{
    url: `api/og?title=${frontmatter.title}`,
    width: 1200,
    height: 630,
    alt: ''
  }]
  */

  if (frontmatter.og_image)
    metadata.openGraph!.images = [{
      url: frontmatter.og_image,
      width: 1200,
      height: 630,
      alt: ''
    }]

  return metadata
}

export const dynamicParams = false
export async function generateStaticParams() {
  function getMdSlugs(folder: string, paths: string[] = []) {
    const slugs = paths
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''))
      .map((slug) => path.join(folder, slug))
      .map((slug) => slug.split('/'))
      .map((slug) => ({ slug }))
    return slugs
  }

  const app = path.join(process.cwd(), 'app')
  const files = await fs.readdir(app, { withFileTypes: true })
  const folders = files.filter((file) => file.isDirectory())
  let slugs = await Promise.all(
    folders.map(async (folder) => {
      const pathsInFolder = await fs.readdir(path.join(app, folder.name))
      return getMdSlugs(folder.name, pathsInFolder)
    })
  )
  .then((slugs) => slugs.flat())

  const pathsInAppFolder = files.map((file) => file.name)
  const slugsFromAppFolder = getMdSlugs('', pathsInAppFolder)
  slugs = slugs.concat(slugsFromAppFolder)
  return slugs
}

export default async function Page(
  { params }:
  { params: { slug: string[] } }
) {
  const { content } = await readPage(params.slug)

  return (
    <Suspense>
      {content}
    </Suspense>
  )
}