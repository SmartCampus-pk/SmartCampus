/**
 * Converts Polish characters to their ASCII equivalents and creates a URL-friendly slug
 */
export const slugify = (text: string): string => {
  const polishMap: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
    Ą: 'A',
    Ć: 'C',
    Ę: 'E',
    Ł: 'L',
    Ń: 'N',
    Ó: 'O',
    Ś: 'S',
    Ź: 'Z',
    Ż: 'Z',
  }

  return text
    .split('')
    .map((char) => polishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  collection: string,
  payload: any,
  excludeId?: string | number,
): Promise<string> => {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await payload.find({
      collection,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    // If no existing doc found, or the only match is the current doc being updated
    if (
      existing.docs.length === 0 ||
      (existing.docs.length === 1 && existing.docs[0].id === excludeId)
    ) {
      return slug
    }

    // Try next number
    slug = `${baseSlug}-${counter}`
    counter++
  }
}
