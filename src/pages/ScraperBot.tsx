import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LicenseBadge } from '@/components/ui/license-badge';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { mockBuyLicense } from '@/lib/mock-web3';
import { IPAsset, License } from '@/types';
import { toast } from 'sonner';
import { 
  Bot, Search, Loader2, AlertCircle, CheckCircle2, ShieldOff, Shield, 
  Terminal, Send, Code, Cpu, Wifi, WifiOff, Wallet 
} from 'lucide-react';

const ScraperBot = () => {
  const { isConnected, address, connect } = useWallet();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    asset?: IPAsset;
    license?: License;
  } | null>(null);
  const [buying, setBuying] = useState(false);
  const [purchased, setPurchased] = useState<{ licenseId: string; txHash: string } | null>(null);

  const extractDomain = (inputUrl: string): string => {
    try {
      let processedUrl = inputUrl;
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      const urlObj = new URL(processedUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return inputUrl.replace('www.', '').split('/')[0];
    }
  };

  const handleQuery = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    setResult(null);
    setPurchased(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const domain = extractDomain(url);
      const asset = storage.getIPAssetByDomain(domain);
      
      if (asset) {
        const license = storage.getLicense(asset.ipId, 'scrape');
        setResult({ found: true, asset, license });
      } else {
        setResult({ found: false });
      }
    } catch (error) {
      toast.error('Failed to query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLicense = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!result?.asset || !result?.license) return;

    setBuying(true);
    try {
      const buyResult = await mockBuyLicense();

      storage.savePurchasedLicense({
        id: crypto.randomUUID(),
        licenseId: buyResult.licenseId,
        ipId: result.asset.ipId,
        licenseType: 'scrape',
        buyerAddress: address,
        txHash: buyResult.txHash,
        purchasedAt: new Date().toISOString(),
      });

      setPurchased(buyResult);
      toast.success('Scrape license purchased!');
    } catch (error) {
      toast.error('Failed to purchase license');
    } finally {
      setBuying(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-accent/10 border border-accent/30 mb-6">
              <Bot className="h-12 w-12 text-accent" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Scraper <span className="text-gradient-purple">Simulator</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simulate what an AI agent sees when accessing a protected website
            </p>
          </div>

          {/* Terminal-style Query Interface */}
          <div className="terminal rounded-xl overflow-hidden mb-8">
            <div className="terminal-header flex items-center justify-between">
              <div className="flex gap-2">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-500" />
                <div className="terminal-dot bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">scrapesafe-bot.sh</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground font-mono text-sm">
                <Cpu className="h-4 w-4 text-primary" />
                <span>ScrapeSafe Bot v1.0</span>
                <span className="text-primary">|</span>
                <span>License Checker</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-primary font-mono">$</span>
                <span className="text-muted-foreground font-mono">check-license --url</span>
                <div className="flex-1 relative">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="example.com"
                    className="font-mono bg-transparent border-none pl-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  />
                </div>
                <Button 
                  onClick={handleQuery} 
                  disabled={loading}
                  size="sm"
                  className="glow-cyan"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono animate-pulse">
                  <Wifi className="h-4 w-4 text-primary" />
                  <span>Querying ScrapeSafe registry...</span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {!result.found ? (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-8">
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-xl bg-yellow-500/10 flex-shrink-0">
                      <WifiOff className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-yellow-500 mb-2">Domain Not Registered</h3>
                      <p className="text-muted-foreground text-lg mb-4">
                        This domain is not protected by ScrapeSafe IP. The website owner hasn't set up licensing terms.
                      </p>
                      <div className="terminal rounded-lg p-4">
                        <code className="text-sm font-mono">
                          <span className="text-red-400">ERROR:</span> No IP asset found for domain
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Found - Asset Info */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
                    <div className="flex items-start gap-6">
                      <div className="p-4 rounded-xl bg-primary/10 flex-shrink-0 animate-glow-pulse">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Wifi className="h-4 w-4 text-neon-green" />
                          <span className="text-xs font-mono text-neon-green uppercase tracking-wider">Protected Asset Found</span>
                        </div>
                        <h3 className="font-display text-2xl font-bold mb-4">{result.asset?.title}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="terminal rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Domain</p>
                            <p className="font-mono text-primary">{result.asset?.domain}</p>
                          </div>
                          <div className="terminal rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">IP ID</p>
                            <p className="font-mono text-primary text-sm truncate">{result.asset?.ipId}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* License Details */}
                  <div className="card-cyber rounded-xl bg-card border border-border p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <LicenseBadge type="scrape" enabled={result.license?.enabled} />
                        <h4 className="font-display text-xl font-semibold">Scrape License</h4>
                      </div>
                      {result.license?.enabled && (
                        <span className="flex items-center gap-2 text-sm text-neon-green">
                          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                          Available
                        </span>
                      )}
                    </div>

                    {result.license?.enabled ? (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="rounded-xl bg-surface p-4 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="font-semibold text-neon-green">Enabled</p>
                          </div>
                          <div className="rounded-xl bg-surface p-4 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Price</p>
                            <p className="font-mono font-bold text-primary text-xl">{result.license.price} ETH</p>
                          </div>
                          <div className="rounded-xl bg-surface p-4 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Payment Token</p>
                            <p className="font-mono text-sm">Native ETH</p>
                          </div>
                        </div>

                        <div className="terminal rounded-lg p-4">
                          <p className="text-xs text-muted-foreground mb-2">License Terms</p>
                          <p className="text-sm">
                            License grants access to scrape content from this domain according to the specified terms.
                          </p>
                        </div>

                        {purchased ? (
                          <div className="rounded-xl bg-neon-green/10 border border-neon-green/30 p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <CheckCircle2 className="h-6 w-6 text-neon-green" />
                              <span className="font-display text-lg font-bold text-neon-green">License Purchased!</span>
                            </div>
                            <p className="text-muted-foreground mb-4">
                              Add these headers to your scraping requests:
                            </p>
                            <div className="terminal rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground uppercase">HTTP Headers</span>
                              </div>
                              <pre className="font-mono text-sm text-primary overflow-x-auto">
{`X-SCRAPESAFE-LICENSE-ID: ${purchased.licenseId}
X-SCRAPESAFE-IP-ID: ${result.asset?.ipId}
X-SCRAPESAFE-BUYER: ${address}`}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isConnected ? (
                              <Button 
                                onClick={handleBuyLicense} 
                                disabled={buying} 
                                size="lg"
                                className="w-full h-14 text-lg glow-cyan font-semibold"
                              >
                                {buying && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                                Buy Scrape License for {result.license.price} ETH
                              </Button>
                            ) : (
                              <Button 
                                onClick={connect} 
                                size="lg"
                                className="w-full h-14 text-lg glow-cyan font-semibold"
                              >
                                <Wallet className="h-5 w-5 mr-2" />
                                Connect Wallet to Buy
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          Scrape license is not enabled for this asset. The owner has not set up terms for web scraping.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ScraperBot;
