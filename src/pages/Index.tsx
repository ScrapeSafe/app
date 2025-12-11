import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Shield, Globe, Brain, Bot, ArrowRight, Zap, Lock, Coins, Sparkles, Database, Code } from 'lucide-react';
import logo from '@/assets/logo.png';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="orb orb-cyan w-[600px] h-[600px] -top-40 -left-40" />
        <div className="orb orb-purple w-[500px] h-[500px] -bottom-40 -right-40" style={{ animationDelay: '-4s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-primary/30 animate-pulse-glow rounded-full" />
                <img 
                  src={logo} 
                  alt="ScrapeSafe IP" 
                  className="h-28 w-auto relative z-10 animate-float drop-shadow-2xl"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
                <Sparkles className="inline h-4 w-4 mr-2" />
                Built on Story Protocol
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Get <span className="text-gradient glow-text-cyan">Paid</span> When AI
              <br />
              Scrapes Your <span className="text-gradient-purple glow-text-purple">Content</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Register websites and content as on-chain IP assets. 
              Set licensing terms. <span className="text-foreground">Let AI agents pay for access.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="glow-cyan text-lg px-10 h-14 font-semibold">
                  Creator Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/market">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14 border-primary/30 hover:bg-primary/10 hover:border-primary/50">
                  Explore Marketplace
                </Button>
              </Link>
              <Link to="/bot">
                <Button size="lg" variant="ghost" className="text-lg px-8 h-14 hover:bg-accent/10">
                  <Bot className="mr-2 h-5 w-5 text-accent" />
                  Simulate Scraper
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <StatCard number="10K+" label="IPs Registered" />
              <StatCard number="$2M+" label="Creator Earnings" />
              <StatCard number="50K+" label="Licenses Sold" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="text-primary font-mono text-sm tracking-wider uppercase">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Three Steps to <span className="text-gradient">Monetization</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Globe}
              step="01"
              title="Register Your IP"
              description="Add your websites or content as Story Protocol IP assets. Verify ownership and receive your unique on-chain ipId."
            />
            <FeatureCard
              icon={Lock}
              step="02"
              title="Set License Terms"
              description="Define scraping and training licenses with custom pricing, payment tokens, and legal terms uploaded to IPFS."
            />
            <FeatureCard
              icon={Coins}
              step="03"
              title="Get Paid"
              description="AI agents discover your content in the marketplace and purchase licenses via smart contracts."
            />
          </div>
        </div>
      </section>

      {/* License Types Section */}
      <section className="py-32 relative">
        <div className="orb orb-purple w-[400px] h-[400px] top-1/2 left-0 -translate-y-1/2" style={{ animationDelay: '-2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="text-accent font-mono text-sm tracking-wider uppercase">License Types</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Two Ways to <span className="text-gradient-purple">Monetize</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="card-cyber rounded-2xl p-8 bg-card border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/20 border border-primary/30">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-mono text-primary uppercase tracking-wider">License Type 0</span>
                  <h3 className="font-display text-2xl font-bold">Scrape License</h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                Allow AI agents and web scrapers to access and extract data from your website or content in real-time.
              </p>
              <ul className="space-y-3">
                <FeatureListItem icon={Zap} text="Real-time data access" color="primary" />
                <FeatureListItem icon={Database} text="Rate limiting controls" color="primary" />
                <FeatureListItem icon={Code} text="API-style access" color="primary" />
              </ul>
            </div>

            <div className="card-cyber rounded-2xl p-8 bg-card border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-accent/20 border border-accent/30">
                  <Brain className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <span className="text-xs font-mono text-accent uppercase tracking-wider">License Type 1</span>
                  <h3 className="font-display text-2xl font-bold">Training License</h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                Permit AI companies to use your content for training their machine learning models.
              </p>
              <ul className="space-y-3">
                <FeatureListItem icon={Zap} text="Dataset inclusion rights" color="accent" />
                <FeatureListItem icon={Database} text="Model training authorization" color="accent" />
                <FeatureListItem icon={Code} text="Commercial use terms" color="accent" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber" />
        <div className="orb orb-cyan w-[300px] h-[300px] top-1/2 right-1/4 -translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary/10 border border-primary/30 mb-8">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Protect Your Content.
              <br />
              <span className="text-gradient">Monetize the AI Revolution.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of creators taking control of how AI uses their work.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="glow-cyan-intense text-lg px-12 h-16 font-bold animate-glow-pulse">
                Start Protecting Your IP
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ScrapeSafe" className="h-8 w-auto" />
              <span className="font-display text-lg">
                ScrapeSafe<span className="text-primary">IP</span>
              </span>
            </div>
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/market" className="text-muted-foreground hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/bot" className="text-muted-foreground hover:text-primary transition-colors">Simulator</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Built on <span className="text-primary">Story Protocol</span>
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const FeatureCard = ({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  description: string;
}) => (
  <div className="card-cyber rounded-2xl p-8 bg-card border border-border group">
    <div className="flex items-center justify-between mb-6">
      <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="font-display text-4xl font-bold text-primary/20">{step}</span>
    </div>
    <h3 className="font-display text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const FeatureListItem = ({ 
  icon: Icon, 
  text, 
  color 
}: { 
  icon: React.ElementType; 
  text: string; 
  color: 'primary' | 'accent';
}) => (
  <li className="flex items-center gap-3 text-muted-foreground">
    <Icon className={`h-4 w-4 ${color === 'primary' ? 'text-primary' : 'text-accent'}`} />
    {text}
  </li>
);

export default Index;
