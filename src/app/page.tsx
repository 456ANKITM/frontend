import PublicNavbar from '@/components/common/PublicNavbar'
import Features from '@/components/HomePageSpecific/Features'
import Hero from '@/components/HomePageSpecific/Hero'
import HowItWorks from '@/components/HomePageSpecific/Howitworks'
import ProblemSolution from '@/components/HomePageSpecific/ProblemSolution'
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
    </div>
  )
}

export default page