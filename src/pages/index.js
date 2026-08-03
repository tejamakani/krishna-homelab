import React from "react";
import Layout from "@theme/Layout";
import Hero from "../components/Hero/Hero";

export default function Home() {
  return (
    <Layout
      title="Makani's HomeLab"
      description="Enterprise-grade HomeLab Documentation"
    >
      <Hero />
    </Layout>
  );
}