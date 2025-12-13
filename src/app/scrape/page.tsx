"use client";

import { useState, ReactNode } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Globe, Search, Loader2, Send, Cpu, Wifi, Code,
    Database, CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap,
    FileText, Heading, Link as LinkIcon, Image, Tag, List, Eye, EyeOff
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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        main_content: true,
        headings: true,
        post_titles: true,
        links: true,
        selectors: false,
        raw_data: false,
    });

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
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mt-4">
                                    <Wifi className="h-4 w-4 text-primary" />
                                    <span>Scraping website</span>
                                    <LoadingDots />
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

                                    {/* Quick Stats */}
                                    {result.data && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            {(() => {
                                                const stats = [];
                                                if (result.data.context?.main_content) {
                                                    stats.push({ key: 'main_content', label: 'Content', count: result.data.context.main_content.length, icon: FileText, color: 'text-primary' });
                                                }
                                                if (result.data.context?.headings) {
                                                    stats.push({ key: 'headings', label: 'Headings', count: result.data.context.headings.length, icon: Heading, color: 'text-accent' });
                                                }
                                                if (result.data.context?.post_titles) {
                                                    stats.push({ key: 'post_titles', label: 'Titles', count: result.data.context.post_titles.length, icon: Tag, color: 'text-neon-green' });
                                                }
                                                if (result.data.link) {
                                                    stats.push({ key: 'links', label: 'Links', count: result.data.link.length, icon: LinkIcon, color: 'text-neon-purple' });
                                                }
                                                return stats.slice(0, 4).map((stat) => {
                                                    const Icon = stat.icon;
                                                    return (
                                                        <div key={stat.key} className="card-cyber rounded-xl p-4 bg-card border border-border">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Icon className={`h-4 w-4 ${stat.color}`} />
                                                                <span className="text-xs font-mono text-muted-foreground">{stat.label}</span>
                                                            </div>
                                                            <div className="font-display text-2xl font-bold">
                                                                {stat.count}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                items extracted
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}

                                    {/* Main Content Section */}
                                    {result.data?.context?.main_content && result.data.context.main_content.length > 0 && (
                                        <SectionCard
                                            title="Main Content"
                                            icon={FileText}
                                            iconColor="text-primary"
                                            count={result.data.context.main_content.length}
                                            expanded={expandedSections.main_content}
                                            onToggle={() => setExpandedSections({ ...expandedSections, main_content: !expandedSections.main_content })}
                                        >
                                            <div className="space-y-3">
                                                {result.data.context.main_content.map((content: string, idx: number) => (
                                                    <div key={idx} className="p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/30 transition-colors">
                                                        <p className="text-sm leading-relaxed text-foreground">{content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* Headings Section */}
                                    {result.data?.context?.headings && result.data.context.headings.length > 0 && (
                                        <SectionCard
                                            title="Headings"
                                            icon={Heading}
                                            iconColor="text-accent"
                                            count={result.data.context.headings.length}
                                            expanded={expandedSections.headings}
                                            onToggle={() => setExpandedSections({ ...expandedSections, headings: !expandedSections.headings })}
                                        >
                                            <div className="space-y-2">
                                                {result.data.context.headings.map((heading: string, idx: number) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-surface/50 border border-border/50 hover:border-accent/30 transition-colors">
                                                        <h3 className="font-display font-semibold text-accent">{heading}</h3>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* Post Titles Section */}
                                    {result.data?.context?.post_titles && result.data.context.post_titles.length > 0 && (
                                        <SectionCard
                                            title="Post Titles"
                                            icon={Tag}
                                            iconColor="text-neon-green"
                                            count={result.data.context.post_titles.length}
                                            expanded={expandedSections.post_titles}
                                            onToggle={() => setExpandedSections({ ...expandedSections, post_titles: !expandedSections.post_titles })}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {result.data.context.post_titles.map((title: string, idx: number) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-surface/50 border border-border/50 hover:border-neon-green/30 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                                                            <span className="text-sm font-medium">{title}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* Links Section */}
                                    {result.data?.link && result.data.link.length > 0 && (
                                        <SectionCard
                                            title="Links & Images"
                                            icon={LinkIcon}
                                            iconColor="text-neon-purple"
                                            count={result.data.link.length}
                                            expanded={expandedSections.links}
                                            onToggle={() => setExpandedSections({ ...expandedSections, links: !expandedSections.links })}
                                        >
                                            <div className="space-y-3">
                                                {result.data.link.map((link: any, idx: number) => (
                                                    <div key={idx} className="p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-neon-purple/30 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            {link.type === 'img' && (
                                                                <div className="p-2 rounded-lg bg-neon-purple/10 flex-shrink-0">
                                                                    <Image className="h-4 w-4 text-neon-purple" />
                                                                </div>
                                                            )}
                                                            {link.type !== 'img' && (
                                                                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                                                                    <LinkIcon className="h-4 w-4 text-primary" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <a
                                                                    href={link.href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-primary hover:text-primary/80 break-all font-mono"
                                                                >
                                                                    {link.href}
                                                                </a>
                                                                {link.text && (
                                                                    <p className="text-xs text-muted-foreground mt-1">{link.text}</p>
                                                                )}
                                                                {link.type && (
                                                                    <Badge variant="outline" className="mt-2 text-xs">
                                                                        {link.type}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* Selectors Section */}
                                    {result.data?.selectors && Object.keys(result.data.selectors).length > 0 && (
                                        <SectionCard
                                            title="CSS Selectors"
                                            icon={Code}
                                            iconColor="text-muted-foreground"
                                            count={Object.keys(result.data.selectors).length}
                                            expanded={expandedSections.selectors}
                                            onToggle={() => setExpandedSections({ ...expandedSections, selectors: !expandedSections.selectors })}
                                        >
                                            <div className="space-y-3">
                                                {Object.entries(result.data.selectors).map(([key, selectors]: [string, any]) => (
                                                    <div key={key} className="p-4 rounded-lg bg-surface/50 border border-border/50">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-mono text-muted-foreground uppercase">{key}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {Array.isArray(selectors) ? selectors.length : 1} selector{Array.isArray(selectors) && selectors.length !== 1 ? 's' : ''}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {Array.isArray(selectors) ? (
                                                                selectors.map((selector: string, idx: number) => (
                                                                    <code key={idx} className="block text-xs font-mono text-foreground bg-background p-2 rounded border border-border/50">
                                                                        {selector}
                                                                    </code>
                                                                ))
                                                            ) : (
                                                                <code className="block text-xs font-mono text-foreground bg-background p-2 rounded border border-border/50">
                                                                    {String(selectors)}
                                                                </code>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    )}

                                    {/* Raw Data Section */}
                                    <SectionCard
                                        title="Raw JSON Data"
                                        icon={Database}
                                        iconColor="text-muted-foreground"
                                        count={Object.keys(result.data || {}).length}
                                        expanded={expandedSections.raw_data}
                                        onToggle={() => setExpandedSections({ ...expandedSections, raw_data: !expandedSections.raw_data })}
                                    >
                                        <div className="p-4 rounded-lg bg-surface/50 border border-border/50 overflow-x-auto">
                                            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        </div>
                                    </SectionCard>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

// Loading Dots Component
const LoadingDots = () => {
    return (
        <span className="inline-flex gap-0.5 ml-1">
            <span className="inline-block animate-dot1">.</span>
            <span className="inline-block animate-dot2">.</span>
            <span className="inline-block animate-dot3">.</span>
        </span>
    );
};

// Section Card Component
const SectionCard = ({
    title,
    icon: Icon,
    iconColor,
    count,
    expanded,
    onToggle,
    children,
}: {
    title: string;
    icon: any;
    iconColor: string;
    count: number;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
}) => {
    return (
        <div className="card-cyber rounded-xl bg-card border border-border overflow-hidden">
            <button
                type="button"
                className="w-full flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-surface/50 transition-colors text-left"
                onClick={(e) => {
                    e.preventDefault();
                    onToggle();
                }}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-')}/10`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div>
                        <span className="font-semibold">{title}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                            {count}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>
            {expanded && (
                <div className="p-6">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ScrapePage;
