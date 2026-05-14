import React from 'react';
import { Settings, Shield, Clock, ThumbsUp } from 'lucide-react';

export function TrustSection() {
  const benefits = [
    {
      icon: <Settings className="w-8 h-8 text-blue-600" />,
      title: 'Expert Mechanics',
      description: 'Our team has over 10 years of experience in repairing all models of two-wheelers.'
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: 'Genuine Spare Parts',
      description: 'We only use OEM and high-quality genuine spare parts for longevity and safety.'
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: 'Same Day Delivery',
      description: 'Get your bike serviced and returned on the same day for maximum convenience.'
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-blue-600" />,
      title: 'Satisfaction Guaranteed',
      description: 'Thousands of happy riders from Madhubani trust us with their vehicles.'
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Riders Trust Us</h2>
          <p className="text-lg text-slate-600">
            We don't just repair bikes; we ensure your safety on the road. Here is why Mukesh Auto Garage is the top choice in Harlakhi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
