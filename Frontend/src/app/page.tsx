import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustSection } from '@/components/home/TrustSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { LocationSection } from '@/components/home/LocationSection';
import { FloatingButtons } from '@/components/home/FloatingButtons';
import { Navbar } from '@/components/common/Navbar';

import { Footer } from '@/components/common/Footer';

async function getShopSettings() {
  try {
    // Ideally this hits your backend service directly if it's in the same monorepo
    // Or we use a direct fetch. Since it's server side, we can just fetch the API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shop-settings/default`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getShopSettings();

  const title = settings?.seoTitle || 'Mukesh Auto Garage | Best Bike Service & Repair in Madhubani';
  const description = settings?.seoDescription || 'Expert two-wheeler repair, washing, and servicing in Beta Parsa, Harlakhi, Madhubani. Fast, trusted, and affordable bike service center. Book your appointment today!';

  return {
    title,
    description,
    keywords: settings?.seoKeywords,
    openGraph: {
      title,
      description,
      images: [settings?.banner || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070'],
    }
  };
}

export default async function HomePage() {
  const settings = await getShopSettings();

  // JSON-LD for LocalBusiness SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: settings?.shopName || 'Mukesh Auto Garage',
    image: settings?.banner || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070',
    '@id': 'https://mukeshautogarage.com',
    url: 'https://mukeshautogarage.com',
    telephone: settings?.phone || '+917827871342',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address || 'Beta Parsa',
      addressLocality: settings?.city || 'Harlakhi, Madhubani',
      addressRegion: settings?.state || 'Bihar',
      postalCode: settings?.pincode || '847225',
      addressCountry: settings?.country || 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: settings?.latitude || 26.6718424,
      longitude: settings?.longitude || 85.9080646,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '09:00',
      closes: '20:00',
    },
    priceRange: '₹₹',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen max-w-screen-7xl mx-auto bg-slate-50  selection:bg-blue-200">
        <Navbar />
        <HeroSection />
        <TrustSection />
        <ServicesSection />
        <LocationSection />
        <FloatingButtons />
        <Footer />
      </main>
    </>
  );
}
