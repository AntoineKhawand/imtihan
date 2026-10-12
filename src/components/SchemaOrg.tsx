/**
 * SchemaOrg — injects JSON-LD structured data into the page <head>.
 * Server component — no "use client" needed.
 *
 * Usage:
 *   import { SchemaOrg } from "@/components/SchemaOrg";
 *   <SchemaOrg schema={{ "@type": "SoftwareApplication", ... }} />
 */

type SchemaOrgProps = {
  schema: Record<string, unknown> | Record<string, unknown>[];
};

export function SchemaOrg({ schema }: SchemaOrgProps) {
  // Prevent authored text containing </script> from ending the JSON-LD tag.
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
