interface MdxDocument { id: string; data: { title: string; description: string } }

/** One registry for authored documentation routes; duplicate paths are errors. */
export function documentationPaths<Document extends MdxDocument>(documents: Document[]) {
  const seen = new Set<string>()
  return documents.map(document => {
    const route = document.id
    if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(route)) throw new Error('Invalid documentation route: ' + route)
    if (seen.has(route)) throw new Error('Duplicate documentation route: ' + route)
    seen.add(route)
    return { params: { guide: route }, props: { document } }
  })
}
