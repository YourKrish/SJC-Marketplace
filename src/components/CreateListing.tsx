import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Upload, ImagePlus, X } from 'lucide-react';
import { Category, Condition, CATEGORY_LABELS, CONDITION_LABELS, calculateListingFee, LISTING_FEE_PERCENTAGE, Listing } from '@/lib/types';
import { addListing } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/auth';
import { compressImage, MAX_IMAGES } from '@/lib/imageUtils';

interface CreateListingProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  user?: User | null;
}

export default function CreateListing({ open, onClose, onCreated, user }: CreateListingProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [sellerName, setSellerName] = useState('');
  const [sellerContact, setSellerContact] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && open) {
      setSellerName(user.name);
      setSellerContact(user.email);
    }
  }, [user, open]);

  const priceNum = parseFloat(price) || 0;
  const listingFee = calculateListingFee(priceNum);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) {
      toast({ title: 'Max images reached', description: `You can upload up to ${MAX_IMAGES} images.`, variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const filesToProcess = Array.from(files).slice(0, remaining);
      const compressed = await Promise.all(filesToProcess.map(compressImage));
      setImageUrls((prev) => [...prev, ...compressed]);
    } catch {
      toast({ title: 'Upload failed', description: 'Could not process one or more images.', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.length > 100) errs.title = 'Title must be under 100 characters';
    if (!description.trim()) errs.description = 'Description is required';
    if (description.length > 500) errs.description = 'Description must be under 500 characters';
    if (!price || priceNum <= 0) errs.price = 'Enter a valid price';
    if (priceNum > 50000) errs.price = 'Price cannot exceed R50 000';
    if (!category) errs.category = 'Select a category';
    if (!condition) errs.condition = 'Select condition';
    if (!sellerName.trim()) errs.sellerName = 'Your name is required';
    if (sellerName.length > 50) errs.sellerName = 'Name must be under 50 characters';
    if (!sellerContact.trim()) errs.sellerContact = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerContact)) errs.sellerContact = 'Enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildListing = (advertised: boolean): Listing => ({
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    price: priceNum,
    category: category as Category,
    condition: condition as Condition,
    sellerName: sellerName.trim(),
    sellerContact: sellerContact.trim(),
    imageUrls,
    createdAt: new Date().toISOString(),
    advertised
  });

  const handleAdvertise = () => {
    if (!validate()) return;
    setStep('payment');
  };

  const saveListing = async (advertised: boolean) => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addListing(buildListing(advertised));
      setStep('success');
      toast({ title: 'Listing created!', description: advertised ? 'Your advertised product is now live on the marketplace.' : 'Your product is now live on the marketplace.' });
    } catch (e) {
      toast({ title: 'Could not save listing', description: e instanceof Error ? e.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleListFree = () => {
    saveListing(false);
  };

  const handlePay = () => {
    saveListing(true);
  };

  const handleClose = () => {
    setStep('form');
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setCondition('');
    setSellerName('');
    setSellerContact('');
    setImageUrls([]);
    setErrors({});
    onClose();
    if (step === 'success') onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'form' &&
        <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create Listing</DialogTitle>
              <DialogDescription>
                List your school items for sale. You can list for free or pay a {(LISTING_FEE_PERCENTAGE * 100).toFixed(0)}% fee to advertise it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Item Title</Label>
                <Input id="title" placeholder="e.g. Grade 10 History Textbook" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the item, condition details, etc." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Image Upload */}
              <div>
                <Label>Photos (up to {MAX_IMAGES})</Label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {imageUrls.map((url, i) =>
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">

                        <X className="w-3 h-3" />
                      </button>
                    </div>
                )}
                  {imageUrls.length < MAX_IMAGES &&
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <ImagePlus className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {uploading ? 'Loading...' : 'Add'}
                      </span>
                      <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading} />

                    </label>
                }
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Price (ZAR)</Label>
                  <Input id="price" type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} min={0} max={50000} />
                  {errors.price && <p className="text-destructive text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) =>
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                    )}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-destructive text-xs mt-1">{errors.category}</p>}
                </div>
              </div>

              <div>
                <Label>Condition</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITION_LABELS).map(([key, label]) =>
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                  )}
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-destructive text-xs mt-1">{errors.condition}</p>}
              </div>

              















              {priceNum > 0 &&
            <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Price</span>
                    <span className="font-medium">R{priceNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Advertising Fee ({(LISTING_FEE_PERCENTAGE * 100).toFixed(0)}%)</span>
                    <span className="font-medium text-secondary">R{listingFee.toFixed(2)}</span>
                  </div>
                </div>
            }

              <div className="flex gap-3">
                <Button onClick={handleListFree} variant="outline" className="flex-1" size="lg" disabled={saving}>
                  <Upload className="w-4 h-4 mr-2" />
                  {saving ? 'Saving…' : 'List for Free'}
                </Button>
                <Button onClick={handleAdvertise} className="flex-1 bg-gradient-gold text-gold-foreground font-semibold hover:opacity-90" size="lg" disabled={saving}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Advertise — R{listingFee.toFixed(2)}
                </Button>
              </div>
            </div>
          </>
        }

        {step === 'payment' &&
        <div className="text-center space-y-6 py-4">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Confirm Payment</DialogTitle>
            </DialogHeader>

            <div className="bg-muted rounded-xl p-6 space-y-3">
              <p className="text-sm text-muted-foreground">Advertising Fee</p>
              <p className="text-3xl font-bold text-primary">R{listingFee.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {(LISTING_FEE_PERCENTAGE * 100).toFixed(0)}% of R{priceNum.toFixed(2)} listing price
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              <h4 className="font-semibold text-sm">{title}</h4>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">{category && CATEGORY_LABELS[category as Category]}</Badge>
                <Badge variant="outline" className="text-xs">{condition && CONDITION_LABELS[condition as Condition]}</Badge>
              </div>
              {imageUrls.length > 0 &&
            <p className="text-xs text-muted-foreground">{imageUrls.length} photo{imageUrls.length > 1 ? 's' : ''} attached</p>
            }
            </div>

            <div className="flex items-start gap-2 text-left bg-accent/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-accent-foreground">
                This fee covers your listing advertisement on the St John's College Marketplace. Advertised listings get priority visibility.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handlePay} className="flex-1 bg-gradient-navy text-navy-foreground hover:opacity-90" disabled={saving}>
                {saving ? 'Saving…' : 'Pay & List Now'}
              </Button>
            </div>
          </div>
        }

        {step === 'success' &&
        <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold">Listed Successfully!</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Your item "{title}" is now live on the marketplace.
              </p>
            </div>
            <Button onClick={handleClose} className="bg-gradient-navy text-navy-foreground hover:opacity-90">
              View Marketplace
            </Button>
          </div>
        }
      </DialogContent>
    </Dialog>);

}