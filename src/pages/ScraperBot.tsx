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
import { Bot, Search, Loader2, AlertCircle, CheckCircle2, ShieldOff, Shield } from 'lucide-react';

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
      // Add protocol if missing
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
      const domain = extractDomain(url);
      
      // Query storage for IP asset by domain
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Scraper Simulator</h1>
            <p className="text-muted-foreground">
              Simulate what an AI agent or web scraper would see when accessing a protected website
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Query Website</CardTitle>
              <CardDescription>
                Enter a URL to check if it's registered as a ScrapeSafe IP asset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  />
                  <Button onClick={handleQuery} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <>
              {!result.found ? (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <ShieldOff className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Not Registered</h3>
                        <p className="text-muted-foreground">
                          This domain is not registered as a ScrapeSafe IP asset. 
                          The website owner hasn't set up licensing terms for AI access.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">Protected IP Asset Found</h3>
                          <p className="text-muted-foreground mb-4">
                            This domain is registered with ScrapeSafe IP.
                          </p>
                          
                          <div className="grid gap-3">
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground">Asset Title</p>
                              <p className="font-medium">{result.asset?.title}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground">IP ID</p>
                              <p className="font-mono text-sm break-all">{result.asset?.ipId}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LicenseBadge type="scrape" enabled={result.license?.enabled} />
                        Scrape License
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.license?.enabled ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-secondary">
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className="font-semibold text-primary">Available</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary">
                              <p className="text-xs text-muted-foreground">Price</p>
                              <p className="font-mono font-semibold">{result.license.price} ETH</p>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-secondary">
                            <p className="text-xs text-muted-foreground mb-1">Terms</p>
                            <p className="text-sm">
                              License grants access to scrape content from this domain according to the specified terms.
                            </p>
                          </div>

                          {purchased ? (
                            <div className="space-y-4">
                              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <div className="flex items-center gap-2 mb-4">
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                  <p className="font-semibold">License Purchased!</p>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Use these headers in your scraping requests:
                                </p>
                                <pre className="text-xs font-mono bg-background p-3 rounded overflow-x-auto">
{`X-SCRAPESAFE-LICENSE-ID: ${purchased.licenseId}
X-SCRAPESAFE-IP-ID: ${result.asset?.ipId}
X-SCRAPESAFE-BUYER: ${address}`}
                                </pre>
                              </div>
                            </div>
                          ) : (
                            <>
                              {isConnected ? (
                                <Button onClick={handleBuyLicense} disabled={buying} className="w-full glow-cyan">
                                  {buying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Buy Scrape License for {result.license.price} ETH
                                </Button>
                              ) : (
                                <Button onClick={connect} className="w-full glow-cyan">
                                  Connect Wallet to Buy
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 text-yellow-500">
                          <AlertCircle className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm">
                            Scrape license is not enabled for this asset. The owner has not set up terms for web scraping.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ScraperBot;
