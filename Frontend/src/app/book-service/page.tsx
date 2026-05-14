import { Metadata } from 'next';
import BookServiceForm from './BookServiceForm';

export const metadata: Metadata = {
  title: 'Book Bike Service | Mukesh Auto Garage',
  description: 'Book your bike service, oil change, washing or repair appointment online at Mukesh Auto Garage in Beta Parsa, Harlakhi, Madhubani.',
  keywords: 'bike service Madhubani, garage in Harlakhi, two wheeler repair Bihar, bike washing near me, motorcycle repair shop, Mukesh Auto Garage',
  openGraph: {
    title: 'Book Bike Service | Mukesh Auto Garage',
    description: 'Book your bike repair and service appointment online instantly.',
    url: 'https://mukeshautogarage.com/book-service',
    siteName: 'Mukesh Auto Garage',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mukeshautogarage.com/book-service',
  }
};

export default function BookServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">
            Book Your Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule an appointment for your bike at Mukesh Auto Garage. Quick, reliable, and professional service.
          </p>
        </div>
        
        <BookServiceForm />
      </div>

      {/* Structured Data for LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoRepair",
            "name": "Mukesh Auto Garage",
            "image": "https://mukeshautogarage.com/logo.png",
            "@id": "",
            "url": "https://mukeshautogarage.com",
            "telephone": "+917827871342",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Beta Parsa",
              "addressLocality": "Harlakhi, Madhubani",
              "addressRegion": "Bihar",
              "postalCode": "847240",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 26.6342,
              "longitude": 85.9324
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:00",
              "closes": "20:00"
            }
          })
        }}
      />
    </div>
  );
}
