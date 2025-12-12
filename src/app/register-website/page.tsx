"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { mockUploadToIPFS } from '@/lib/mock-ipfs';
import { mockRegisterIP } from '@/lib/mock-web3';
import { toast } from 'sonner';
import { Globe, Copy, Check, Loader2, ArrowLeft, CheckCircle2, RefreshCw, Server, FileText, Code } from 'lucide-react';
import { z } from 'zod';

const domainSchema = z.string().min(1, 'Domain is required').regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
    'Please enter a valid domain (e.g., example.com)'
);

interface VerificationMethods {
    dns: {
        record: string;
        type: string;
        value: string;
        instructions: string;
    };
    metaTag: {
        tag: string;
        location: string;
        instructions: string;
    };
    file: {
        path: string;
        content: string;
        instructions: string;
    };
}

const RegisterWebsite = () => {
    const router = useRouter();
    const { isConnected, address, connect } = useWallet();
    const [step, setStep] = useState<'form' | 'verify' | 'register' | 'complete'>('form');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const [domain, setDomain] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [verified, setVerified] = useState(false);
    const [registeredIpId, setRegisteredIpId] = useState('');
    const [siteId, setSiteId] = useState<number | null>(null);
    const [verificationToken, setVerificationToken] = useState('');
    const [verificationMethods, setVerificationMethods] = useState<VerificationMethods | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<'dns' | 'metaTag' | 'file'>('dns');

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
        toast.success('Copied to clipboard');
    };

    const handleRegisterDomain = async () => {
        try {
            domainSchema.parse(domain);
        } catch (error) {
            if (error instanceof z.ZodError) {
                toast.error(error.errors[0].message);
                return;
            }
        }

        if (!address) {
            toast.error('Wallet not connected');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/owner/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain,
                    ownerWallet: address,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            const data = await response.json();
            setSiteId(data.siteId);
            setVerificationToken(data.verificationToken);
            setVerificationMethods(data.verificationMethods);
            setStep('verify');
            toast.success('Domain registered! Please verify ownership.');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!siteId) {
            toast.error('Site ID not found. Please register the domain first.');
            return;
        }

        setVerifying(true);
        try {
            const response = await fetch('/api/owner/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    siteId,
                    method: selectedMethod,
                }),
            });

            const data = await response.json();

            if (data.ok) {
                setVerified(true);
                setStep('register');
                toast.success('Domain ownership verified!');
            } else {
                toast.error(data.error || 'Verification failed. Please check your configuration and try again.');
            }
        } catch (error: any) {
            toast.error('Verification failed. Please try again.');
        } finally {
            setVerifying(false);
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

                <div className="max-w-3xl mx-auto">
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
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleRegisterDomain();
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter your domain without http:// or https://
                                        </p>
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

                                    <Button 
                                        onClick={handleRegisterDomain} 
                                        disabled={loading || !domain.trim()}
                                        className="w-full"
                                    >
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Register Domain & Get Verification Token
                                    </Button>
                                </div>
                            )}

                            {step === 'verify' && verificationMethods && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                            Domain Registered
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your domain <strong>{domain}</strong> has been registered. 
                                            Please verify ownership using one of the methods below.
                                        </p>
                                    </div>

                                    <Tabs value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as 'dns' | 'metaTag' | 'file')}>
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="dns" className="flex items-center gap-2">
                                                <Server className="h-4 w-4" />
                                                DNS
                                            </TabsTrigger>
                                            <TabsTrigger value="metaTag" className="flex items-center gap-2">
                                                <Code className="h-4 w-4" />
                                                Meta Tag
                                            </TabsTrigger>
                                            <TabsTrigger value="file" className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                File
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="dns" className="space-y-4">
                                            <div className="p-4 rounded-lg bg-secondary border border-border">
                                                <h3 className="font-semibold mb-2">DNS TXT Record Verification</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Add a TXT record to your domain's DNS settings to verify ownership.
                                                </p>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Record Name</Label>
                                                        <div className="relative mt-1">
                                                            <pre className="p-3 rounded bg-background border border-border overflow-x-auto text-xs font-mono">
                                                                {verificationMethods.dns.record}
                                                            </pre>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="absolute top-2 right-2"
                                                                onClick={() => handleCopy(verificationMethods.dns.record, 'dns-record')}
                                                            >
                                                                {copied === 'dns-record' ? (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Record Type</Label>
                                                        <Input value={verificationMethods.dns.type} readOnly className="mt-1 font-mono" />
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Record Value</Label>
                                                        <div className="relative mt-1">
                                                            <pre className="p-3 rounded bg-background border border-border overflow-x-auto text-xs font-mono break-all">
                                                                {verificationMethods.dns.value}
                                                            </pre>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="absolute top-2 right-2"
                                                                onClick={() => handleCopy(verificationMethods.dns.value, 'dns-value')}
                                                            >
                                                                {copied === 'dns-value' ? (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-3 rounded bg-muted/50 border border-border">
                                                    <p className="text-xs text-muted-foreground">
                                                        <strong>Instructions:</strong> {verificationMethods.dns.instructions}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        After adding the DNS record, wait a few minutes for propagation, then click Verify below.
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="metaTag" className="space-y-4">
                                            <div className="p-4 rounded-lg bg-secondary border border-border">
                                                <h3 className="font-semibold mb-2">Meta Tag Verification</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Add this meta tag to your website's HTML <code className="text-primary">&lt;head&gt;</code> section.
                                                </p>
                                                
                                                <div className="relative">
                                                    <pre className="p-3 rounded bg-background border border-border overflow-x-auto text-xs font-mono">
                                                        {verificationMethods.metaTag.tag}
                                                    </pre>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => handleCopy(verificationMethods.metaTag.tag, 'meta-tag')}
                                                    >
                                                        {copied === 'meta-tag' ? (
                                                            <Check className="h-4 w-4 text-primary" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="mt-4 p-3 rounded bg-muted/50 border border-border">
                                                    <p className="text-xs text-muted-foreground">
                                                        <strong>Location:</strong> {verificationMethods.metaTag.location}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {verificationMethods.metaTag.instructions}
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="file" className="space-y-4">
                                            <div className="p-4 rounded-lg bg-secondary border border-border">
                                                <h3 className="font-semibold mb-2">File Verification</h3>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Create a verification file at the specified path on your website.
                                                </p>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">File Path</Label>
                                                        <div className="relative mt-1">
                                                            <pre className="p-3 rounded bg-background border border-border overflow-x-auto text-xs font-mono">
                                                                {verificationMethods.file.path}
                                                            </pre>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="absolute top-2 right-2"
                                                                onClick={() => handleCopy(verificationMethods.file.path, 'file-path')}
                                                            >
                                                                {copied === 'file-path' ? (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">File Content</Label>
                                                        <div className="relative mt-1">
                                                            <pre className="p-3 rounded bg-background border border-border overflow-x-auto text-xs font-mono">
                                                                {verificationMethods.file.content}
                                                            </pre>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="absolute top-2 right-2"
                                                                onClick={() => handleCopy(verificationMethods.file.content, 'file-content')}
                                                            >
                                                                {copied === 'file-content' ? (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-3 rounded bg-muted/50 border border-border">
                                                    <p className="text-xs text-muted-foreground">
                                                        {verificationMethods.file.instructions}
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex gap-3">
                                        <Button 
                                            onClick={handleVerify} 
                                            disabled={verifying} 
                                            className="flex-1"
                                        >
                                            {verifying ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Verify Ownership
                                                </>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setStep('form')} 
                                            disabled={verifying}
                                        >
                                            Back
                                        </Button>
                                    </div>
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
