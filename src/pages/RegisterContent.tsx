import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FileText, Upload, Link as LinkIcon, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const RegisterContent = () => {
  const navigate = useNavigate();
  const { isConnected, address, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [registeredIpId, setRegisteredIpId] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name);
      }
    }
  };

  const handleRegister = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!file && !contentUrl.trim()) {
      toast.error('Please upload a file or provide a content URL');
      return;
    }

    setLoading(true);
    try {
      // Upload content to IPFS
      let contentUri = contentUrl;
      if (file) {
        contentUri = await mockUploadToIPFS(file);
      }

      // Upload metadata to IPFS
      const metadata = {
        name: title,
        description,
        contentUrl: contentUri,
        type: 'content',
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
        type: 'content',
        title,
        description,
        contentUrl: contentUri,
        metadataUri,
        ownerAddress: address!,
        verified: true,
        createdAt: new Date().toISOString(),
      });

      setRegisteredIpId(ipId);
      setComplete(true);
      toast.success('Content registered as IP asset!');
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
            <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Register Content</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to register your content as an IP asset.
            </p>
            <Button onClick={connect} className="glow-cyan">
              Connect Wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (complete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Registration Complete!</h3>
                    <p className="text-muted-foreground">
                      Your content has been registered as an IP asset.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary border border-border text-left">
                    <p className="text-sm text-muted-foreground mb-1">IP ID:</p>
                    <p className="font-mono text-sm break-all">{registeredIpId}</p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                      Go to Dashboard
                    </Button>
                    <Button onClick={() => navigate('/market')} className="flex-1">
                      View in Marketplace
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Register Content
              </CardTitle>
              <CardDescription>
                Register your content (image, article, video, etc.) as a Story Protocol IP asset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Content Title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your content..."
                  rows={3}
                />
              </div>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Paste URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      {file ? (
                        <p className="text-sm">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Images, videos, documents, etc.
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contentUrl">Content URL</Label>
                    <Input
                      id="contentUrl"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="https://example.com/my-content"
                    />
                    <p className="text-xs text-muted-foreground">
                      Direct link to your content (image, article, etc.)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={handleRegister} disabled={loading} className="w-full glow-cyan">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register as Story IP
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterContent;
