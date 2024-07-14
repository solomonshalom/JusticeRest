// Use as a function, not a component. For example:
//   meta({title: 'cool title', description: 'cool desc', url: '/cool'})
// Instead of:
//   <Meta title="cool title" description="cool desc" url="/cool" />

// Define types for the function parameters
interface MetaProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

export default function meta({ title, description, url, image, type }: MetaProps): JSX.Element {
  // We prefix relative urls with the VERCEL_URL that vercel sets for us on deployments
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://justice.rest'
      : 'https://' + process.env.VERCEL_URL;

  if (url) {
    url = url.startsWith('/') ? baseUrl + url : url;
  }

  if (image) {
    image = image.startsWith('/') ? baseUrl + image : image;
  }

  return (
    <>
      {/* Primary meta tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph/Facebook */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}
    </>
  );
}
