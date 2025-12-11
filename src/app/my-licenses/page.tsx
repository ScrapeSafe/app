"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { LicenseBadge } from '@/components/ui/license-badge';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { PurchasedLicense, IPAsset } from '@/types';
import { FileText, Globe, Ticket, ExternalLink, Wallet, Calendar, Hash, Code } from 'lucide-react';

const MyLicenses = () => {
    const { isConnected, address, connect } = useWallet();
    const [purchases, setPurchases] = useState<(PurchasedLicense & { asset?: IPAsset })[]>([]);

    useEffect(() => {
        if (address) {
            loadData();
        }
    }, [address]);

    const loadData = () => {
        if (!address) return;

        const myPurchases = storage.getPurchasedLicensesByBuyer(address);
        const purchasesWithAssets = myPurchases.map((purchase) => ({
            ...purchase,
            asset: storage.getIPAssetByIpId(purchase.ipId),
        }));

        setPurchases(purchasesWithAssets);
    };

    if (!isConnected) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center relative">
                    <div className="orb orb-purple w-[400px] h-[400px] top-1/4 left-1/4" />
                    <div className="orb orb-cyan w-[300px] h-[300px] bottom-1/4 right-1/4" style={{ animationDelay: '-3s' }} />

                    <div className="max-w-lg mx-auto text-center relative z-10 px-4">
                        <div className="inline-flex items-center justify-center p-6 rounded-2xl bg-accent/10 border border-accent/30 mb-8">
                            <Ticket className="h-16 w-16 text-accent" />
                        </div>
                        <h1 className="font-display text-4xl font-bold mb-4">My Licenses</h1>
                        <p className="text-lg text-muted-foreground mb-10">
                            Connect your wallet to view your purchased licenses.
                        </p>
                        <Button onClick={connect} size="lg" className="glow-purple px-10 h-14 text-lg font-semibold">
                            <Wallet className="h-5 w-5 mr-2" />
                            Connect Wallet
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-10">
                    <span className="text-accent font-mono text-sm tracking-wider uppercase">License Portfolio</span>
                    <h1 className="font-display text-4xl font-bold mt-2">My Purchased Licenses</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Manage your acquired AI scraping and training licenses</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="card-cyber rounded-xl bg-card border border-border p-5 text-center">
                        <div className="font-display text-3xl font-bold text-primary">{purchases.length}</div>
                        <div className="text-sm text-muted-foreground">Total Licenses</div>
                    </div>
                    <div className="card-cyber rounded-xl bg-card border border-border p-5 text-center">
                        <div className="font-display text-3xl font-bold text-neon-cyan">
                            {purchases.filter(p => p.licenseType === 'scrape').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Scrape Licenses</div>
                    </div>
                    <div className="card-cyber rounded-xl bg-card border border-border p-5 text-center">
                        <div className="font-display text-3xl font-bold text-accent">
                            {purchases.filter(p => p.licenseType === 'train').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Train Licenses</div>
                    </div>
                </div>

                {purchases.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-accent/20 bg-accent/5 p-16 text-center">
                        <div className="inline-flex p-6 rounded-2xl bg-accent/10 mb-6">
                            <Ticket className="h-12 w-12 text-accent" />
                        </div>
                        <h3 className="font-display text-2xl font-bold mb-3">No Licenses Yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                            Browse the marketplace and purchase licenses to access AI-ready content.
                        </p>
                        <Link href="/market">
                            <Button size="lg" className="px-8">
                                Explore Marketplace
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {purchases.map((purchase) => (
                            <LicenseCard key={purchase.id} purchase={purchase} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

const LicenseCard = ({ purchase }: { purchase: PurchasedLicense & { asset?: IPAsset } }) => {
    const isScrape = purchase.licenseType === 'scrape';

    return (
        <div className="card-cyber rounded-xl bg-card border border-border overflow-hidden">
            {/* Header gradient */}
            <div className={`h-2 ${isScrape
                ? 'bg-gradient-to-r from-primary to-neon-cyan'
                : 'bg-gradient-to-r from-accent to-purple-400'
                }`} />

            <div className="p-5">
                {/* Asset Info */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                            {purchase.asset?.title || 'Unknown Asset'}
                        </h3>
                        <p className="font-mono text-xs text-muted-foreground truncate mt-1">
                            {purchase.asset?.domain || 'Content Asset'}
                        </p>
                    </div>
                    <div className={`p-2 rounded-lg ${purchase.asset?.type === 'website' ? 'bg-primary/10' : 'bg-accent/10'
                        }`}>
                        {purchase.asset?.type === 'website' ? (
                            <Globe className="h-5 w-5 text-primary" />
                        ) : (
                            <FileText className="h-5 w-5 text-accent" />
                        )}
                    </div>
                </div>

                {/* License Badge */}
                <div className="mb-4">
                    <LicenseBadge type={purchase.licenseType} />
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-sm">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">License ID:</span>
                        <span className="font-mono text-foreground">{purchase.licenseId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Purchased:</span>
                        <span>{new Date(purchase.purchasedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* TX Hash */}
                <div className="terminal rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Code className="h-3 w-3 text-primary" />
                        <span className="text-xs text-muted-foreground">TX Hash</span>
                    </div>
                    <p className="font-mono text-xs text-primary truncate">{purchase.txHash}</p>
                </div>

                {/* Action */}
                <Link href={`/license/${purchase.ipId}/${purchase.licenseType}`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`w-full ${isScrape
                            ? 'border-primary/30 hover:bg-primary/10'
                            : 'border-accent/30 hover:bg-accent/10'
                            }`}
                    >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View License Details
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default MyLicenses;
