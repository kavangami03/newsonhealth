// src/utils/schema.ts

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}

export function generateOrganizationSchema(siteTitle: string, siteUrl: string, siteLogoUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": siteTitle,
    "url": siteUrl,
    "logo": siteLogoUrl || "",
    "sameAs": [
      // Add social links here if available
    ]
  };
}

export function generateMedicalWebPageSchema(title: string, description: string, url: string, datePublished?: string, imageUrl?: string, authorName = "Dr Louise Newson") {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": authorName,
      "jobTitle": "GP & Menopause Specialist"
    }
  };
}
