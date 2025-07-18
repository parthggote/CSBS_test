'use client'

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Award, Users, TrendingUp, Building, CheckCircle, Star, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import LottieAnimation from "@/components/LottieAnimation";
import businessAnimation from "../public/lottie-business.json";
import { useEffect, useState, useRef } from "react";
import Spline from '@splinetool/react-spline';

export default function HomePage() {
  const accomplishments = [
    {
      title: "Academic Excellence",
      description: "Consistently ranked among the top departments in the university for academic results and student performance.",
      icon: TrendingUp,
      stats: "Top Ranked",
    },
    {
      title: "TCS Partnership",
      description: "Exclusive collaboration with TCS for industry-ready curriculum",
      icon: Building,
      stats: "Since 2020",
    },
    {
      title: "Research & Innovation",
      description: "Active involvement in research and innovation by faculty and students, contributing to the advancement of technology and business systems.",
      icon: Award,
      stats: "Research Driven",
    },
    {
      title: "Experienced Faculties",
      description: "Faculties with years of experience and knowledge in Technical and Business related domains provide a great environment for development.",
      icon: Award,
      stats: "Experience ",
    },
  ]

  // Typewriter effect for hero description
  const typewriterText = "Bridging the gap between technology and business through innovative education, industry partnerships, and cutting-edge research. Preparing tomorrow's tech leaders today.";

  function useTypewriter(text: string, speed = 30, pause = 1200) {
    const [displayed, setDisplayed] = useState("");
    const [index, setIndex] = useState(0);
    useEffect(() => {
      if (index < text.length) {
        const timeout = setTimeout(() => {
          setDisplayed((prev) => prev + text[index]);
          setIndex(index + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayed("");
          setIndex(0);
        }, pause);
        return () => clearTimeout(timeout);
      }
    }, [index, text, speed, pause]);
    return displayed;
  }

  // Intersection Observer for section heading animations
  const [headingsInView, setHeadingsInView] = useState<{[key:string]:boolean}>({});
  const headingRefs = {
    vision: useRef<HTMLHeadingElement>(null),
    why: useRef<HTMLHeadingElement>(null),
    accomplishments: useRef<HTMLHeadingElement>(null),
  };
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeadingsInView((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.4 }
    );
    Object.values(headingRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  // Hide Spline watermark robustly
  useEffect(() => {
    function hideSplineWatermark() {
      // Try to hide by title, href, aria-label, or text content
      const selectors = [
        'a[title*="Spline"]',
        'a[href*="spline.design"]',
        'a[aria-label*="Spline"]',
        'div[title*="Spline"]'
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.pointerEvents = 'none';
        });
      });
      // Hide by text content (for extra robustness)
      document.querySelectorAll('div,span').forEach(el => {
        if (el.textContent?.includes('Built with Spline')) {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.pointerEvents = 'none';
        }
      });
    }
    hideSplineWatermark();

    // MutationObserver to catch dynamically added watermark
    const observer = new MutationObserver(hideSplineWatermark);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', hideSplineWatermark);
    window.addEventListener('orientationchange', hideSplineWatermark);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', hideSplineWatermark);
      window.removeEventListener('orientationchange', hideSplineWatermark);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Spline 3D Model Only */}
      <section className="relative py-20 overflow-hidden bg-background min-h-[400px] md:min-h-[600px] flex items-center justify-center">
        {/* Subtle, wide gradient overlay for hero (optional, can be removed if you want pure 3D) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-300/20 to-transparent opacity-10 blur-[2px] z-0 pointer-events-none" />
        <div className="relative w-full h-[400px] md:h-[710px] z-10 flex items-center justify-center -translate-y-20 md:-translate-y-32">
          <Spline
            scene="https://prod.spline.design/HV4FycB8MpWOMdRw/scene.splinecode"
            className="!w-full !h-full rounded-2xl shadow-2xl pointer-events-none"
          />
          {/* Improved Overlay to hide Spline logo */}
          <div
            className="absolute"
            style={{
              right: '1%',
              bottom: '2%',
              width: '210px',
              height: '48px',
              background: 'rgba(0,0,0,1)', // fully black, fully opaque
              borderRadius: '16px',
              zIndex: 30,
              pointerEvents: 'none',
            }}
          />
          {/* Floating CTA Buttons Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-4 z-20 pointer-events-auto">
            <Link href="/events">
              <Button size="lg" className="rounded-full px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Explore Events
              </Button>
            </Link>
            <Link href="/resources">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-4 text-lg font-bold border-2 border-blue-500 text-blue-700 bg-white/80 hover:bg-blue-50 hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 shadow-md">
                <BookOpen className="w-5 h-5" />
                Access Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section with gradient blobs */}
      <section className="relative py-20 bg-background overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[28rem] h-[20rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[90px] z-0" />
        <div className="absolute bottom-0 right-0 w-[18rem] h-[18rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[60px] z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2
              id="vision"
              ref={headingRefs.vision}
              className={`text-3xl md:text-4xl font-bold text-foreground mb-4 transition-opacity duration-700 ${headingsInView.vision ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
            >
              Vision & Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Shaping the future of technology and business integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-300">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p>
                    To be a globally recognized center of excellence in Computer Science and Business Systems education
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p>Foster innovation and entrepreneurship in technology-driven business solutions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p>Create industry-ready professionals who can bridge technology and business domains</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-600 dark:text-purple-300">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p>Provide comprehensive education combining computer science fundamentals with business acumen</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p>Establish strong industry partnerships for practical learning and placement opportunities</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p>Promote research and innovation in emerging technologies and business applications</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why CSBS Section with gradient blobs */}
      <section className="relative py-20 bg-background overflow-hidden">
        <div className="absolute -top-16 left-0 w-[20rem] h-[20rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
        <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2
              id="why"
              ref={headingRefs.why}
              className={`text-3xl md:text-4xl font-bold text-foreground mb-4 transition-opacity duration-700 ${headingsInView.why ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
            >
              Why Choose CSBS?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the perfect blend of technology and business education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>TCS Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Exclusive partnership with TCS providing industry-aligned curriculum, internships, and direct
                  placement opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Industry Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Accredited programs with industry recognition and certifications that enhance your career prospects.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                KIT’s Engineering College, in collaboration with TCS, offers a 4-year B.Tech in Computer Science and Business Systems to meet rising tech industry demands.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Notable Accomplishments Section with gradient blobs */}
      <section className="relative py-20 bg-background overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[22rem] h-[14rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-25 rounded-full blur-[70px] z-0" />
        <div className="absolute bottom-0 right-0 w-[14rem] h-[14rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-15 rounded-full blur-[40px] z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2
              id="accomplishments"
              ref={headingRefs.accomplishments}
              className={`text-3xl md:text-4xl font-bold text-foreground mb-4 transition-opacity duration-700 ${headingsInView.accomplishments ? 'animate-slide-up opacity-100' : 'opacity-0'}`}
            >
              Notable Accomplishments
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Celebrating our achievements and milestones</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {accomplishments.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                  <Badge variant="secondary">{item.stats}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 tcs-gradient text-white dark:bg-background dark:text-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discover upcoming events, access valuable resources, and connect with fellow students and faculty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" variant="secondary">
                View Events
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background text-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CSBS Department</h3>
              <p className="text-gray-400">Computer Science and Business Systems - Bridging Technology and Business</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/events" className="hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-foreground">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/resources" className="hover:text-foreground">
                    PYQs
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-foreground">
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-foreground">
                    Interview Prep
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                Department of CSBS
                <br />
                Your Institution Name
                <br />
                Email: csbs@institution.edu
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CSBS Department. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
