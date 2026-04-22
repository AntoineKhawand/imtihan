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
  const json = Array.isArray(schema)
    ? JSON.stringify(schema)
    : JSON.stringify(schema);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
