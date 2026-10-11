/** Public URL for a stored media key such as "media/project/abc.jpg". */
export function mediaUrl(key: string): string {
  return `/${key}`;
}
