import Layout from "@theme/Layout";

import Hero from "../components/Hero/Hero";
import Dashboard from "../components/Dashboard/Dashboard";

export default function Home() {
  return (
    <Layout
      title="Makani's HomeLab"
      description="Enterprise HomeLab Documentation"
    >
      <Hero />

      <Dashboard />
    </Layout>
  );
}