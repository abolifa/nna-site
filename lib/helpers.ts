export function getImageUrl(src: string) {
  return `${process.env.NEXT_PUBLIC_IMAGE_URL}/${src}`;
}
