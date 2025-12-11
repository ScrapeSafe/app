import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LicenseBadge } from '@/components/ui/license-badge';
import { storage } from '@/lib/storage';
import { IPAsset, License } from '@/types';
import { Globe, FileText, Search, ExternalLink } from 'lucide-react';

const Market = () => {
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allAssets = storage.getIPAssets();
    const enabledLicenses = storage.getEnabledLicenses();
    
    // Filter assets that have at least one enabled license
    const assetsWithLicenses = allAssets.filter((asset) =>
      enabledLicenses.some((l) => l.ipId === asset.ipId)
    );

    setAssets(assetsWithLicenses);
    setLicenses(enabledLicenses);
  };

  const getLicensesForAsset = (ipId: string) => {
    return licenses.filter((l) => l.ipId === ipId);
  };

  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.toLowerCase();
    return (
      asset.title.toLowerCase().includes(query) ||
      asset.domain?.toLowerCase().includes(query) ||
      asset.description.toLowerCase().includes(query)
    );
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">IP Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and license IP assets for web scraping and AI training
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="pl-10"
            />
          </div>
        </div>

        {filteredAssets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Globe className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No Licensed Assets Yet</p>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Be the first to register your content and set up licenses for AI agents.
              </p>
              <Link to="/dashboard">
                <Button>Register Your IP</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => {
              const assetLicenses = getLicensesForAsset(asset.ipId);
              const scrapeLicense = assetLicenses.find((l) => l.licenseType === 'scrape');
              const trainLicense = assetLicenses.find((l) => l.licenseType === 'train');

              return (
                <Card key={asset.id} className="group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                          {asset.title}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs truncate">
                          {asset.domain || 'Content Asset'}
                        </CardDescription>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary">
                        {asset.type === 'website' ? (
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {asset.description || 'No description provided'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {scrapeLicense?.enabled && (
                        <LicenseBadge type="scrape" />
                      )}
                      {trainLicense?.enabled && (
                        <LicenseBadge type="train" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {scrapeLicense?.enabled && (
                        <div className="p-2 rounded bg-secondary">
                          <p className="text-xs text-muted-foreground">Scrape</p>
                          <p className="font-mono font-semibold">{scrapeLicense.price} ETH</p>
                        </div>
                      )}
                      {trainLicense?.enabled && (
                        <div className="p-2 rounded bg-secondary">
                          <p className="text-xs text-muted-foreground">Train</p>
                          <p className="font-mono font-semibold">{trainLicense.price} ETH</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {scrapeLicense?.enabled && (
                        <Link to={`/license/${asset.ipId}/scrape`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Scrape
                          </Button>
                        </Link>
                      )}
                      {trainLicense?.enabled && (
                        <Link to={`/license/${asset.ipId}/train`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Train
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Market;
