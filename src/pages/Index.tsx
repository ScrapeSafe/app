import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Shield, Globe, Brain, Bot, ArrowRight, Zap, Lock, Coins } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <img 
                src={logo} 
                alt="ScrapeSafe IP" 
                className="h-20 w-auto animate-float"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Get <span className="text-gradient">Paid</span> When AI Scrapes or Trains on{' '}
              <span className="text-gradient">Your Content</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Register your websites and content as on-chain IP assets. Set your terms. 
              Let AI agents pay for access. Built on Story Protocol.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="glow-cyan text-lg px-8">
                  Creator Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/market">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Explore Marketplace
                </Button>
              </Link>
              <Link to="/bot">
                <Button size="lg" variant="ghost" className="text-lg px-8">
                  <Bot className="mr-2 h-5 w-5" />
                  Simulate Scraper
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It <span className="text-gradient">Works</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Globe}
              title="Register Your IP"
              description="Add your websites or content as Story Protocol IP assets. Verify ownership and get your unique ipId."
            />
            <FeatureCard
              icon={Lock}
              title="Set License Terms"
              description="Define scraping and training licenses with custom pricing, terms, and payment tokens."
            />
            <FeatureCard
              icon={Coins}
              title="Get Paid"
              description="AI agents browse the marketplace and purchase licenses to legally access your content."
            />
          </div>
        </div>
      </section>

      {/* License Types Section */}
      <section className="py-24 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Two License <span className="text-gradient">Types</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="gradient-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Scrape License</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Allow AI agents and web scrapers to access and extract data from your website or content.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Real-time data access
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Rate limiting controls
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Per-request or subscription pricing
                </li>
              </ul>
            </div>

            <div className="gradient-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Training License</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Permit AI companies to use your content for training their machine learning models.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Dataset inclusion rights
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Model training authorization
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Commercial use terms
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Protect Your Content.<br />
              <span className="text-gradient">Monetize the AI Revolution.</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Join creators who are taking control of how AI uses their work.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="glow-cyan-intense">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="ScrapeSafe" className="h-6 w-auto" />
              <span className="font-mono text-sm text-muted-foreground">
                ScrapeSafe<span className="text-primary">IP</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built on Story Protocol • Powered by Web3
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="gradient-border rounded-xl p-6 transition-transform hover:scale-105">
    <div className="p-3 rounded-lg bg-primary/20 w-fit mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
