import PublicNavbar from '@/components/common/PublicNavbar'
import Features from '@/components/HomePageSpecific/Features'
import Hero from '@/components/HomePageSpecific/Hero'
import HowItWorks from '@/components/HomePageSpecific/Howitworks'
import MultiStore from '@/components/HomePageSpecific/MultiStore'
import ProblemSolution from '@/components/HomePageSpecific/ProblemSolution'
import ProductShowcase from '@/components/HomePageSpecific/ProductShowcase'
import ReportsHighlight from '@/components/HomePageSpecific/ReportsHighlight'
import RolesSection from '@/components/HomePageSpecific/RoleSection'
import React from 'react'

const page = () => {
  return (
    <div>
      <PublicNavbar />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <RolesSection />
      <MultiStore />
      <ProductShowcase />
      <ReportsHighlight />
    </div>
  )
}

export default page