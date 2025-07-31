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
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const { user, isAuthenticated, isAdmin, isStudent } = useAuth();
  
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
        'div[title*="Spline"]',
        'a[title*="spline"]',
        'a[href*="spline"]',
        'a[aria-label*="spline"]',
        'div[title*="spline"]',
        'a[href*="spline.design"]',
        'div[class*="spline"]',
        'a[class*="spline"]',
        'div[class*="Spline"]',
        'a[class*="Spline"]'
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.pointerEvents = 'none';
          (el as HTMLElement).style.visibility = 'hidden';
          (el as HTMLElement).style.position = 'absolute';
          (el as HTMLElement).style.left = '-9999px';
          (el as HTMLElement).style.top = '-9999px';
        });
      });
      // Hide by text content (for extra robustness)
      document.querySelectorAll('div,span,a,button').forEach(el => {
        if (el.textContent?.toLowerCase().includes('built with spline') || 
            el.textContent?.toLowerCase().includes('spline') ||
            el.textContent?.toLowerCase().includes('powered by spline') ||
            el.textContent?.toLowerCase().includes('made with spline')) {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.pointerEvents = 'none';
          (el as HTMLElement).style.visibility = 'hidden';
          (el as HTMLElement).style.position = 'absolute';
          (el as HTMLElement).style.left = '-9999px';
          (el as HTMLElement).style.top = '-9999px';
        }
      });
      // Hide any elements with Spline-related classes or IDs
      document.querySelectorAll('[class*="spline"], [class*="Spline"], [id*="spline"], [id*="Spline"]').forEach(el => {
        if (el.classList.contains('spline-watermark') || 
            el.classList.contains('Spline-watermark') ||
            el.textContent?.toLowerCase().includes('spline') ||
            el.id?.toLowerCase().includes('spline')) {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.opacity = '0';
          (el as HTMLElement).style.pointerEvents = 'none';
          (el as HTMLElement).style.visibility = 'hidden';
          (el as HTMLElement).style.position = 'absolute';
          (el as HTMLElement).style.left = '-9999px';
          (el as HTMLElement).style.top = '-9999px';
        }
      });
    }
    
    // Initial hide
    hideSplineWatermark();
    
    // Set up interval to continuously hide (in case Spline re-adds it)
    const interval = setInterval(hideSplineWatermark, 50);

    // MutationObserver to catch dynamically added watermark
    const observer = new MutationObserver(hideSplineWatermark);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', hideSplineWatermark);
    window.addEventListener('orientationchange', hideSplineWatermark);

    return () => {
      clearInterval(interval);
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
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[600px] lg:h-[710px] z-10 flex items-center justify-center -translate-y-12 sm:-translate-y-16 md:-translate-y-24 lg:-translate-y-32">
          <Spline
            scene="https://prod.spline.design/HV4FycB8MpWOMdRw/scene.splinecode"
            className="!w-full !h-full rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl pointer-events-none"
          />
          {/* Dynamic Spline logo hiding is handled by JavaScript */}

          {/* Social Media Icons - Right Side */}
          <div className="absolute right-3 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20 pointer-events-auto">
            <a href="https://www.instagram.com/cabssa_kitcoek/" target="_blank" rel="noopener noreferrer" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 dark:from-pink-600 dark:to-purple-700 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-500 to-purple-600 dark:from-pink-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 group-hover:from-pink-400 group-hover:to-purple-500 group-hover:rotate-3">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:-rotate-3">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 dark:from-sky-600 dark:to-blue-600 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-sky-500 to-blue-500 dark:from-sky-600 dark:to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 group-hover:from-sky-400 group-hover:to-blue-400 group-hover:rotate-6">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
            </a>
            <a href="https://www.youtube.com/@cabssakit" target="_blank" rel="noopener noreferrer" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 group-hover:from-red-500 group-hover:to-red-600 group-hover:-rotate-6">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
            </a>
          </div>

          {/* CTA Buttons - Desktop (Overlay on Spline) */}
          <div className="hidden md:block absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <div className="flex flex-row gap-3 items-center">
              <Link href="/events">
                <Button size="lg" className="rounded-full px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Explore Events</span>
                </Button>
              </Link>
              <Link href="/resources">
                <Button size="lg" variant="outline" className="rounded-full px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-bold border-2 border-blue-500 text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700/80 hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 shadow-md">
                  <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>Access Resources</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Buttons Section - Below Hero (Mobile Only) */}
      <section className="pt-2 pb-8 md:hidden bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link href="/events" className="w-full">
              <Button size="lg" className="rounded-full px-6 py-3 text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 w-full h-12">
                <ArrowRight className="w-4 h-4" />
                <span>Explore Events</span>
              </Button>
            </Link>
            <Link href="/resources" className="w-full">
              <Button size="lg" variant="outline" className="rounded-full px-6 py-3 text-base font-bold border-2 border-blue-500 text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700/80 hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2 shadow-md w-full h-12">
                <BookOpen className="w-4 h-4" />
                <span>Access Resources</span>
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
            {isAuthenticated ? (
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  Student Login
                </Button>
              </Link>
            )}
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
                Email: cabssakit@gmail.com
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
