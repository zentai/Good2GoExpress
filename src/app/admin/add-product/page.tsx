
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, FileImage, Loader2, PlusCircle, Trash2, UploadCloud } from 'lucide-react';
import type { Product, ProductCategorySlug, ProductBadge } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const categories: { slug: ProductCategorySlug; name: string }[] = [
  { slug: 'snack-attack', name: 'Snack Attack' },
  { slug: 'thirst-quenchers', name: 'Thirst Quenchers' },
  { slug: 'everyday-essentials', name: 'Everyday Essentials' },
  { slug: 'home-helpers', name: 'Home Helpers' },
  { slug: 'camp-go', name: 'Camp & Go' },
  { slug: 'best-bundles', name: 'Best Bundles' },
];

const badgeTypes: ProductBadge['type'][] = ['hot', 'limited', 'signature', 'new', 'custom'];

const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  summary: z.string().optional(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.enum(['snack-attack', 'thirst-quenchers', 'everyday-essentials', 'home-helpers', 'camp-go', 'best-bundles']),
  badgeText: z.string().optional(),
  badgeType: z.enum(['hot', 'limited', 'signature', 'new', 'custom']).optional(),
  qty: z.coerce.number().int().min(0, { message: 'Quantity cannot be negative.' }).default(0),
  dataAiHint: z.string().optional(),
  // Images will be handled separately due to FileList type
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      summary: '',
      description: '',
      category: 'snack-attack',
      qty: 12,
      badgeText: '',
      dataAiHint: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newImageFiles = [...imageFiles, ...filesArray].slice(0, 4); // Limit to 4 images
      setImageFiles(newImageFiles);

      const newImagePreviews = newImageFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newImagePreviews);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // 1. Create Firestore document to get an ID (initially without imageUrls)
      const newProductRef = await addDoc(collection(db, 'products'), {
        name: data.name,
        price: data.price,
        summary: data.summary || '',
        description: data.description,
        category: data.category,
        badge: data.badgeType && data.badgeText ? { type: data.badgeType, text: data.badgeText } : null,
        qty: data.qty,
        status: data.qty > 0 ? 'has-stock' : 'out-of-stock',
        dataAiHint: data.dataAiHint || '',
        imageUrls: [], // Placeholder
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const productId = newProductRef.id;
      let uploadedImageUrls: string[] = [];

      // 2. Upload images to Firebase Storage
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const storageRef = ref(storage, `products/${productId}/image_${i}_${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          uploadedImageUrls.push(downloadURL);
        }
      } else {
        // Add a default placeholder if no images are uploaded
        uploadedImageUrls.push('https://placehold.co/600x400.png');
      }
      
      // 3. Update Firestore document with image URLs
      await updateDoc(doc(db, 'products', productId), {
        imageUrls: uploadedImageUrls,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Product Added!',
        description: `${data.name} has been successfully added.`,
      });
      form.reset();
      setImageFiles([]);
      setImagePreviews([]);
      // Optionally redirect or stay on page
      // router.push('/admin'); 
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Product</CardTitle>
          <CardDescription>Fill in the details for the new product.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spicy Chili Chips" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (RM)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (Stock)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary (Short, one-line with emojis)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 🌶️ Fiery chili kick, extra crispy!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed product description..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Product Images (Max 4)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square border rounded-md overflow-hidden group">
                      <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {imageFiles.length < 4 && (
                    <label htmlFor="imageUpload" className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors">
                      <UploadCloud className="h-8 w-8 mb-1" />
                      <span>Upload</span>
                      <input id="imageUpload" type="file" accept="image/*" multiple onChange={handleImageChange} className="sr-only" />
                    </label>
                  )}
                </div>
                 {/* Placeholder for "Take Photo from Camera" */}
                <Button type="button" variant="outline" disabled className="w-full mt-2">
                  <Camera className="mr-2 h-4 w-4" /> Take Photo from Camera (Coming Soon)
                </Button>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="badgeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Type (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select badge type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {badgeTypes.map(type => (
                            <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="badgeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Text (If type selected)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 🔥 Hot or Sale!" {...field} 
                          disabled={!form.watch('badgeType')}
                        />
                      </FormControl>
                      <FormDescription>Only shown if a badge type is selected.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dataAiHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Image Hint (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., chips spicy or fruit basket" {...field} />
                    </FormControl>
                     <FormDescription>Keywords for AI image generation/search.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Product'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
