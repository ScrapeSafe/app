import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LicenseBadge } from '@/components/ui/license-badge';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { mockFetchFromIPFS } from '@/lib/mock-ipfs';
import { mockBuyLicense as mockBuy } from '@/lib/mock-web3';
import { IPAsset, License, LicenseType } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, Globe, FileText, Loader2, CheckCircle2, ExternalLink, Wallet } from 'lucide-react';

const LicenseDetail = () => {
  const { ipId, type } = useParams<{ ipId: string; type: LicenseType }>();
  const navigate = useNavigate();
  const { isConnected, address, connect } = useWallet();
  
  const [asset, setAsset] = useState<IPAsset | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [terms, setTerms] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [purchased, setPurchased] = useState<{ licenseId: string; txHash: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [ipId, type]);

  const loadData = async () => {
    if (!ipId || !type) return;

    setLoading(true);
    try {
      const foundAsset = storage.getIPAssetByIpId(ipId);
      const foundLicense = storage.getLicense(ipId, type);

      setAsset(foundAsset || null);
      setLicense(foundLicense || null);

      if (foundLicense?.termsUri) {
        // Mock fetch terms from IPFS
        await new Promise((resolve) => setTimeout(resolve, 300));
        setTerms('This license grants the purchaser the right to access and use the content according to the specified terms. The license is non-transferable and subject to the payment of the specified fee.');
      }
    } catch (error) {
      toast.error('Failed to load license details');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!license || !asset) return;

    setBuying(true);
    try {
      // Mock buy license on-chain
      const result = await mockBuy();

      // Save purchased license
      storage.savePurchasedLicense({
        id: crypto.randomUUID(),
        licenseId: result.licenseId,
        ipId: asset.ipId,
        licenseType: type as LicenseType,
        buyerAddress: address,
        txHash: result.txHash,
        purchasedAt: new Date().toISOString(),
      });

      setPurchased(result);
      toast.success('License purchased successfully!');
    } catch (error) {
      toast.error('Failed to purchase license');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!asset || !license) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">License Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This license doesn't exist or has been disabled.
            </p>
            <Link to="/market">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/market')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="max-w-3xl mx-auto">
          {purchased ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">License Purchased!</h3>
                    <p className="text-muted-foreground">
                      You now have access to this IP asset.
                    </p>
                  </div>

                  <div className="grid gap-4 text-left">
                    <div className="p-4 rounded-lg bg-secondary border border-border">
                      <p className="text-sm text-muted-foreground mb-1">License ID:</p>
                      <p className="font-mono text-sm">{purchased.licenseId}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Transaction Hash:</p>
                      <p className="font-mono text-sm break-all">{purchased.txHash}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-left">
                    <p className="text-sm font-semibold mb-2">Scraper Headers:</p>
                    <pre className="text-xs font-mono bg-background p-3 rounded overflow-x-auto">
{`X-SCRAPESAFE-LICENSE-ID: ${purchased.licenseId}
X-SCRAPESAFE-IP-ID: ${asset.ipId}
X-SCRAPESAFE-BUYER: ${address}`}
                    </pre>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate('/my-licenses')} className="flex-1">
                      View My Licenses
                    </Button>
                    <Button onClick={() => navigate('/market')} className="flex-1">
                      Back to Marketplace
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {/* Asset Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {asset.type === 'website' ? (
                          <Globe className="h-5 w-5 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                        {asset.title}
                      </CardTitle>
                      <CardDescription className="font-mono">
                        {asset.domain || asset.contentUrl}
                      </CardDescription>
                    </div>
                    <LicenseBadge type={type as LicenseType} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{asset.description}</p>
                </CardContent>
              </Card>

              {/* License Details */}
              <Card>
                <CardHeader>
                  <CardTitle>License Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold font-mono">{license.price} ETH</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary">
                      <p className="text-sm text-muted-foreground">Payment Token</p>
                      <p className="font-mono text-sm truncate">
                        {license.paymentToken === '0x0000000000000000000000000000000000000000'
                          ? 'Native ETH'
                          : license.paymentToken.slice(0, 10) + '...'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-2">IP ID</p>
                    <p className="font-mono text-sm break-all">{asset.ipId}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-2">Terms</p>
                    <p className="text-sm">{terms || 'Loading terms...'}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-2">Receiver</p>
                    <p className="font-mono text-sm break-all">{license.receiverAddress}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Buy Button */}
              {isConnected ? (
                <Button onClick={handleBuy} disabled={buying} size="lg" className="glow-cyan">
                  {buying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Buy License for {license.price} ETH
                </Button>
              ) : (
                <Button onClick={connect} size="lg" className="glow-cyan">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet to Buy
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LicenseDetail;
