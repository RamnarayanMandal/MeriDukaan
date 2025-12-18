"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
 
  StaggerContainer,
  StaggerItem,
  HoverLift,
  FadeIn,
  SlideUp
} from '@/components/ui/motion'
import { 
  Building2, 
  Users, 
  Shield, 
  Wifi, 
  Utensils, 
  Car, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  ArrowRight,
  GraduationCap,
  Home as HomeIcon,
  Search,
  Calendar
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: Building2,
      title: "Premium Tiles",
      description: "Wide selection of high-quality tiles for floors, walls, and bathrooms."
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "All products come with quality assurance and warranty for your peace of mind."
    },
    {
      icon: Star,
      title: "Expert Service",
      description: "Professional guidance and support from our experienced team."
    },
    {
      icon: Building2,
      title: "Marble & Granite",
      description: "Premium natural stone options for elegant and durable surfaces."
    },
    {
      icon: Users,
      title: "Accessories",
      description: "Complete range of tiles accessories and installation materials."
    },
    {
      icon: Phone,
      title: "Customer Support",
      description: "Dedicated customer service to assist with all your needs."
    }
  ]

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Homeowner",
      content: "Excellent quality tiles and great service! The team helped me choose the perfect tiles for my home renovation.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Interior Designer",
      content: "Wide variety of premium products. The marble collection is outstanding and the pricing is competitive.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Contractor",
      content: "Reliable supplier with quality products. Fast delivery and excellent customer support throughout the project.",
      rating: 5
    }
  ]

  const stats = [
    { number: "1000+", label: "Happy Customers" },
    { number: "500+", label: "Products" },
    { number: "24/7", label: "Support" },
    { number: "100%", label: "Satisfaction" }
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <SlideUp className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <HoverLift className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Tiles Shop</span>
            </HoverLift>
           
            <div className="flex items-center space-x-4">
              <HoverLift>
                <Button variant="outline" onClick={() => router.push('/auth/login')}>
                  Login
                </Button>
              </HoverLift>
              <HoverLift>
                <Button onClick={() => router.push('/auth/signup')} className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
                  Get Started
                </Button>
              </HoverLift>
            </div>
          </div>
        </div>
      </SlideUp>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="text-center">
            <StaggerItem>
              <HoverLift className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 mb-4">
                <Building2 className="h-4 w-4 mr-2" />
                Welcome to Premium Tiles Shop
              </HoverLift>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Premium Quality
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Tiles & Marble</span>
                <br />For Your Home
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Discover our wide range of premium tiles, marble, granite, and accessories. 
                Quality products with excellent service for all your construction needs.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <HoverLift>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => router.push('/auth/login')}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    View Products
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </HoverLift>
                <HoverLift>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => router.push('/auth/login')}
                  >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Admin Login
                  </Button>
                </HoverLift>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 p-4">
            {stats.map((stat, index) => (
              <StaggerItem key={index} className="text-center">
                <HoverLift className='p-4 rounded-md bg-slate-50'>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Shop?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide premium quality tiles, marble, and granite with excellent service.
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <HoverLift>
                  <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 hover:rotate-360 transition-transform duration-600">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don&apos;t just take our word for it - hear from our satisfied customers.
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <HoverLift>
                  <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardContent className="pt-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have chosen quality tiles and marble for their projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HoverLift>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => router.push('/auth/login')}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Admin Login
                </Button>
              </HoverLift>
              <HoverLift>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => router.push('/auth/login')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  View Products
                </Button>
              </HoverLift>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <FadeIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StaggerItem>
              <HoverLift className="flex items-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Tiles Shop</span>
              </HoverLift>
              <p className="text-gray-400">
                Your trusted partner for premium tiles, marble, granite, and accessories with quality products and excellent service.
              </p>
            </StaggerItem>
            <StaggerItem>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="#features" className="hover:text-white">Features</a>
                </li>
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="#testimonials" className="hover:text-white">Testimonials</a>
                </li>
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="/auth/login" className="hover:text-white">Admin Login</a>
                </li>
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="/auth/login" className="hover:text-white">View Products</a>
                </li>
              </ul>
            </StaggerItem>
            <StaggerItem>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="/help" className="hover:text-white">Help Center</a>
                </li>
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="/contact" className="hover:text-white">Contact Us</a>
                </li>
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="/faq" className="hover:text-white">FAQ</a>
                </li>
                <li className="hover:translate-x-1 transition-transform duration-200">
                  <a href="/terms" className="hover:text-white">Terms of Service</a>
                </li>
              </ul>
            </StaggerItem>
            <StaggerItem>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center hover:translate-x-1 transition-transform duration-200">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Shop Address, City, State</span>
                </div>
                <div className="flex items-center hover:translate-x-1 transition-transform duration-200">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center hover:translate-x-1 transition-transform duration-200">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@tilesshop.com</span>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
          <FadeIn className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tiles Shop. All rights reserved.</p>
          </FadeIn>
        </div>
        </FadeIn>
      </footer>
    </div>
  )
}
