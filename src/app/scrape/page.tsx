"use client";

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Globe, Search, Loader2, Send, Cpu, Wifi, Code,
    Database, CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const DEFAULT_PROMPTS = [
    { id: 'main_content', label: 'Main Content', description: 'Primary page content' },
    { id: 'headings', label: 'Headings', description: 'All headings (h1-h6)' },
    { id: 'post_titles', label: 'Post Titles', description: 'Article or post titles' },
    { id: 'post_points', label: 'Points/Scores', description: 'Scores or point values' },
    { id: 'post_username', label: 'Usernames', description: 'Author names' },
    { id: 'links', label: 'Links', description: 'All hyperlinks' },
    { id: 'images', label: 'Images', description: 'Image sources and alt text' },
    { id: 'meta_description', label: 'Meta Description', description: 'Page meta info' },
];

interface ScrapeResult {
    success: boolean;
    data?: any;
    url?: string;
    scrapedAt?: string;
    error?: string;
    message?: string;
}

const ScrapePage = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScrapeResult | null>(null);
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([
        'main_content', 'headings', 'post_titles'
    ]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [expandedData, setExpandedData] = useState(true);

    const togglePrompt = (promptId: string) => {
        if (selectedPrompts.includes(promptId)) {
            setSelectedPrompts(selectedPrompts.filter(p => p !== promptId));
        } else if (selectedPrompts.length < 5) {
            setSelectedPrompts([...selectedPrompts, promptId]);
        } else {
            toast.error('Maximum 5 element prompts allowed');
        }
    };

    const handleScrape = async () => {
        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        // Validate URL format
        let processedUrl = url.trim();
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = 'https://' + processedUrl;
        }

        try {
            new URL(processedUrl);
        } catch {
            toast.error('Invalid URL format');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/scrape/url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: processedUrl,
                    elementPrompts: selectedPrompts.length > 0 ? selectedPrompts : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setResult({
                    success: false,
                    error: data.error || 'Scraping failed',
                    message: data.message,
                });
                toast.error(data.error || 'Scraping failed');
            } else {
                setResult(data);
                toast.success('Website scraped successfully!');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            setResult({
                success: false,
                error: 'Failed to connect to backend',
                message: errorMessage,
            });
            toast.error('Failed to connect to backend server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-5 rounded-2xl bg-primary/10 border border-primary/30 mb-6">
                            <Globe className="h-12 w-12 text-primary" />
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                            Web <span className="text-gradient">Scraper</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Extract structured data from any website using AI-powered scraping
                        </p>
                    </div>

                    {/* Terminal-style Interface */}
                    <div className="terminal rounded-xl overflow-hidden mb-8">
                        <div className="terminal-header flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="terminal-dot bg-red-500" />
                                <div className="terminal-dot bg-yellow-500" />
                                <div className="terminal-dot bg-green-500" />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">scrapesafe-scraper.sh</span>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground font-mono text-sm">
                                <Cpu className="h-4 w-4 text-primary" />
                                <span>ScrapeSafe Scraper v1.0</span>
                                <span className="text-primary">|</span>
                                <span>AI-Powered Extraction</span>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-primary font-mono">$</span>
                                <span className="text-muted-foreground font-mono">scrape --url</span>
                                <div className="flex-1 relative">
                                    <Input
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="font-mono bg-transparent border-none pl-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                                    />
                                </div>
                                <Button
                                    onClick={handleScrape}
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

                            {/* Advanced Options */}
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <span className="font-mono">--element-prompts</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                        {selectedPrompts.length}/5
                                    </Badge>
                                </button>

                                {showAdvanced && (
                                    <div className="mt-4 p-4 rounded-lg bg-surface/50 border border-border animate-fade-in">
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Select up to 5 data types to extract (powered by JigsawStack AI):
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {DEFAULT_PROMPTS.map((prompt) => (
                                                <button
                                                    key={prompt.id}
                                                    onClick={() => togglePrompt(prompt.id)}
                                                    className={`p-2 rounded-lg text-left text-xs transition-all ${selectedPrompts.includes(prompt.id)
                                                            ? 'bg-primary/20 border-primary/50 text-primary'
                                                            : 'bg-surface border-border text-muted-foreground hover:bg-surface/80'
                                                        } border`}
                                                >
                                                    <div className="font-medium">{prompt.label}</div>
                                                    <div className="text-[10px] opacity-70">{prompt.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {loading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono animate-pulse mt-4">
                                    <Wifi className="h-4 w-4 text-primary" />
                                    <span>Scraping website...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="space-y-6 animate-fade-in">
                            {!result.success ? (
                                // Error State
                                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-8">
                                    <div className="flex items-start gap-6">
                                        <div className="p-4 rounded-xl bg-red-500/10 flex-shrink-0">
                                            <XCircle className="h-8 w-8 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-xl font-bold text-red-500 mb-2">
                                                Scraping Failed
                                            </h3>
                                            <p className="text-muted-foreground text-lg mb-4">
                                                {result.error}
                                            </p>
                                            {result.message && (
                                                <div className="terminal rounded-lg p-4">
                                                    <code className="text-sm font-mono">
                                                        <span className="text-red-400">ERROR:</span> {result.message}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Success Header */}
                                    <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-neon-green/10">
                                                <CheckCircle2 className="h-6 w-6 text-neon-green" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono text-neon-green uppercase tracking-wider">
                                                        Successfully Scraped
                                                    </span>
                                                </div>
                                                <p className="font-mono text-sm text-muted-foreground truncate">
                                                    {result.url}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Scraped at</p>
                                                <p className="font-mono text-sm">
                                                    {result.scrapedAt ? new Date(result.scrapedAt).toLocaleTimeString() : 'Just now'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scraped Data */}
                                    <div className="card-cyber rounded-xl bg-card border border-border overflow-hidden">
                                        <div
                                            className="flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-surface/50 transition-colors"
                                            onClick={() => setExpandedData(!expandedData)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Database className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-semibold">Scraped Data</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    <Code className="h-3 w-3 mr-1" />
                                                    JSON
                                                </Badge>
                                                {expandedData ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {expandedData && (
                                            <div className="p-4 overflow-x-auto">
                                                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Stats */}
                                    {result.data && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {Object.keys(result.data).slice(0, 4).map((key) => {
                                                const value = result.data[key];
                                                const count = Array.isArray(value) ? value.length : (typeof value === 'string' ? 1 : 0);
                                                return (
                                                    <div key={key} className="card-cyber rounded-xl p-4 bg-card border border-border">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Zap className="h-4 w-4 text-primary" />
                                                            <span className="text-xs font-mono text-muted-foreground">{key}</span>
                                                        </div>
                                                        <div className="font-display text-2xl font-bold">
                                                            {count}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {Array.isArray(value) ? 'items' : 'value'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ScrapePage;
