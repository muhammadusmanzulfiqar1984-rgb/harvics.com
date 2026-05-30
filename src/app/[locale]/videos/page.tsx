'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface VideoItem {
  id: string
  title: string
  description: string
  category: string
  videoPath: string
  thumbnail?: string
}

const VIDEOS: VideoItem[] = [
  {
    id: 'fmcg-hero',
    title: 'FMCG Hero',
    description: 'FMCG distribution and supply chain overview',
    category: 'FMCG',
    videoPath: '/assets/media/video/Product Portfolio2.mp4',
  },
  {
    id: 'supply-chain-logistics',
    title: 'Supply Chain & Logistics',
    description: 'End-to-end supply chain optimization and logistics network',
    category: 'Supply Chain',
    videoPath: '/assets/media/video/Supply chain logistics.mp4',
  },
  {
    id: 'global-network',
    title: 'Global Network',
    description: 'Global reach and network infrastructure',
    category: 'Network',
    videoPath: '/assets/media/video/Global Network.mp4',
  },
  {
    id: 'sustainability',
    title: 'Sustainability Coverage',
    description: 'Sustainability initiatives and coverage',
    category: 'Sustainability',
    videoPath: '/assets/media/video/Sustainbility Coverage .mp4',
  },
  {
    id: 'service-portfolio',
    title: 'Service Portfolio',
    description: 'Complete service portfolio overview',
    category: 'Services',
    videoPath: '/assets/media/video/Service Portfolio.mp4',
  },
  {
    id: 'digital-infrastructure',
    title: 'Digital Infrastructure',
    description: 'Digital infrastructure and technology backbone',
    category: 'Technology',
    videoPath: '/assets/media/video/DIgital Infrastructure 1.mp4',
  },
  {
    id: 'future-vision',
    title: 'Future Vision',
    description: 'Our vision for the future',
    category: 'Vision',
    videoPath: '/assets/media/video/Future Vision .mp4',
  },
  {
    id: 'who-we-are',
    title: 'Who We Are',
    description: 'Company identity and values',
    category: 'About',
    videoPath: '/assets/media/video/WHO WE ARE 2.mp4',
  },
  {
    id: 'global-reach',
    title: 'Global Reach',
    description: 'Global presence and market reach',
    category: 'Network',
    videoPath: '/assets/media/video/Global Reach.mp4',
  },
  {
    id: 'principles',
    title: 'Principles',
    description: 'Core principles and values',
    category: 'About',
    videoPath: '/assets/media/video/Principles.mp4',
  },
  {
    id: 'contact-cta',
    title: 'Contact CTA',
    description: 'Contact call-to-action',
    category: 'Marketing',
    videoPath: '/assets/media/video/Contact CTA.mp4',
  },
  {
    id: 'hero-2',
    title: 'Hero Section 2',
    description: 'Alternative hero section video',
    category: 'Hero',
    videoPath: '/assets/media/video/Hero 2.mp4',
  },
]

const CATEGORIES = Array.from(new Set(VIDEOS.map(v => v.category)))

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(VIDEOS[0])

  const filteredVideos = selectedCategory === 'All' 
    ? VIDEOS 
    : VIDEOS.filter(v => v.category === selectedCategory)

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900 dark:via-red-800 dark:to-red-900">
      <Header />
      
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#6B1F2B] mb-4">
              Video Library
            </h1>
            <p className="text-lg text-black/70 max-w-2xl">
              Explore our collection of videos covering FMCG operations, supply chain logistics, 
              sustainability initiatives, and our vision for the future.
            </p>
          </div>

          {/* Main Video Player */}
          <div className="mb-12 bg-black rounded-lg overflow-hidden shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <video
                key={selectedVideo.id}
                className="absolute top-0 left-0 w-full h-full"
                controls
                controlsList="nodownload"
                poster="/placeholder-video.png"
              >
                <source src={selectedVideo.videoPath} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Video Info */}
          <div className="mb-12 bg-white rounded-lg p-6 shadow-md border border-[#C3A35E]/20">
            <h2 className="text-2xl font-bold text-[#6B1F2B] mb-2">
              {selectedVideo.title}
            </h2>
            <p className="text-black/70 mb-3">{selectedVideo.description}</p>
            <span className="inline-block px-4 py-1 bg-[#C3A35E]/20 text-[#6B1F2B] rounded-full text-sm font-medium">
              {selectedVideo.category}
            </span>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#6B1F2B] mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#6B1F2B] text-white'
                    : 'bg-white text-[#6B1F2B] border-2 border-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#6B1F2B] text-white'
                      : 'bg-white text-[#6B1F2B] border-2 border-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div>
            <h3 className="text-lg font-semibold text-[#6B1F2B] mb-6">
              {selectedCategory === 'All' ? 'All Videos' : `${selectedCategory} Videos`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`relative overflow-hidden rounded-lg shadow-md transition-all hover:shadow-xl cursor-pointer group ${
                    selectedVideo.id === video.id
                      ? 'ring-4 ring-[#6B1F2B]'
                      : ''
                  }`}
                >
                  {/* Video Thumbnail Placeholder */}
                  <div className="relative w-full aspect-video bg-gradient-to-br from-[#6B1F2B]/20 to-[#C3A35E]/20 flex items-center justify-center">
                    <div className="text-4xl text-[#6B1F2B]/30 group-hover:text-[#6B1F2B]/50 transition-colors">
                      ▶
                    </div>
                  </div>
                  
                  {/* Video Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <h4 className="text-white font-bold text-sm">{video.title}</h4>
                    <p className="text-white/80 text-xs">{video.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Video Count */}
          <div className="mt-12 text-center">
            <p className="text-black/60 text-sm">
              Showing {filteredVideos.length} of {VIDEOS.length} videos
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
