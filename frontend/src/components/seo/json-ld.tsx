/** Renders a Schema.org JSON-LD script tag (server component) */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/<\/script>/gi, "<\\/script>"),
          }}
        />
      ))}
    </>
  );
}
