"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { mockUploadToIPFS } from '@/lib/mock-ipfs';
import { mockRegisterIP } from '@/lib/mock-web3';
import { toast } from 'sonner';
import { Globe, Copy, Check, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const domainSchema = z.string().min(1, 'Domain is required').regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
    'Please enter a valid domain (e.g., example.com)'
);

const RegisterWebsite = () => {
    const router = useRouter();
    const { isConnected, address, connect } = useWallet();
    const [step, setStep] = useState<'form' | 'verify' | 'register' | 'complete'>('form');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const [domain, setDomain] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [verified, setVerified] = useState(false);
    const [registeredIpId, setRegisteredIpId] = useState('');

    const metaTag = `<meta name="scrapesafe-verification" content="${address}" />`;

    const handleCopyMetaTag = () => {
        navigator.clipboard.writeText(metaTag);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Meta tag copied to clipboard');
    };

    const handleVerify = async () => {
        try {
            domainSchema.parse(domain);
        } catch (error) {
            if (error instanceof z.ZodError) {
                toast.error(error.errors[0].message);
                return;
            }
        }

        setLoading(true);
        try {
            // Mock verification - in production, call backend API
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Simulate random verification result for demo
            const isVerified = Math.random() > 0.3;

            if (isVerified) {
                setVerified(true);
                setStep('register');
                toast.success('Domain ownership verified!');
            } else {
                toast.error('Verification failed. Please ensure the meta tag is correctly placed in your HTML head.');
            }
        } catch (error) {
            toast.error('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setLoading(true);
        try {
            // Upload metadata to IPFS
            const metadata = {
                name: title,
                description,
                domain,
                type: 'website',
                owner: address,
                createdAt: new Date().toISOString(),
            };
            const metadataUri = await mockUploadToIPFS(metadata);

            // Register IP on Story Protocol
            const { ipId, txHash } = await mockRegisterIP();

            // Save to storage
            storage.saveIPAsset({
                id: crypto.randomUUID(),
                ipId,
                type: 'website',
                title,
                description,
                domain,
                metadataUri,
                ownerAddress: address!,
                verified: true,
                createdAt: new Date().toISOString(),
            });

            setRegisteredIpId(ipId);
            setStep('complete');
            toast.success('Website registered as IP asset!');
        } catch (error) {
            toast.error('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-md mx-auto text-center">
                        <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h1 className="text-3xl font-bold mb-4">Register Website</h1>
                        <p className="text-muted-foreground mb-8">
                            Connect your wallet to register your website as an IP asset.
                        </p>
                        <Button onClick={connect} className="glow-cyan">
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
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-6 w-6 text-primary" />
                                Register Website
                            </CardTitle>
                            <CardDescription>
                                Register your website as a Story Protocol IP asset
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {step === 'form' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="domain">Domain</Label>
                                        <Input
                                            id="domain"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            placeholder="example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="My Awesome Website"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe your website..."
                                            rows={3}
                                        />
                                    </div>

                                    <Button onClick={() => setStep('verify')} className="w-full">
                                        Continue to Verification
                                    </Button>
                                </div>
                            )}

                            {step === 'verify' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-lg bg-secondary border border-border">
                                        <h3 className="font-semibold mb-2">Step 1: Add Meta Tag</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Add the following meta tag to the <code className="text-primary">&lt;head&gt;</code> section of your website:
                                        </p>
                                        <div className="relative">
                                            <pre className="p-3 rounded bg-background border border-border overflow-x-auto text-xs font-mono">
                                                {metaTag}
                                            </pre>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="absolute top-2 right-2"
                                                onClick={handleCopyMetaTag}
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-primary" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-secondary border border-border">
                                        <h3 className="font-semibold mb-2">Step 2: Verify Ownership</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            After adding the meta tag, click below to verify your ownership.
                                        </p>
                                        <Button onClick={handleVerify} disabled={loading} className="w-full">
                                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Verify Ownership
                                        </Button>
                                    </div>

                                    <Button variant="outline" onClick={() => setStep('form')} className="w-full">
                                        Back
                                    </Button>
                                </div>
                            )}

                            {step === 'register' && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        <span className="text-sm">Domain ownership verified for <strong>{domain}</strong></span>
                                    </div>

                                    <div className="p-4 rounded-lg bg-secondary border border-border">
                                        <h3 className="font-semibold mb-4">Register as IP Asset</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Your metadata will be uploaded to IPFS and your website will be registered as a Story Protocol IP asset.
                                        </p>
                                        <Button onClick={handleRegister} disabled={loading} className="w-full glow-cyan">
                                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Register as Story IP
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 'complete' && (
                                <div className="space-y-6 text-center">
                                    <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Registration Complete!</h3>
                                        <p className="text-muted-foreground">
                                            Your website has been registered as an IP asset.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-secondary border border-border text-left">
                                        <p className="text-sm text-muted-foreground mb-1">IP ID:</p>
                                        <p className="font-mono text-sm break-all">{registeredIpId}</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
                                            Go to Dashboard
                                        </Button>
                                        <Button onClick={() => router.push('/market')} className="flex-1">
                                            View in Marketplace
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default RegisterWebsite;
