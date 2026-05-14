import axios from 'axios';

export interface ExternalProductData {
  name: string;
  brand?: string;
  category?: string;
  image?: string;
  barcode: string;
  price?: number;
}

export class BarcodeApiService {
  /**
   * Fetch product details from external barcode APIs
   */
  static async fetchFromExternal(barcode: string): Promise<ExternalProductData | null> {
    try {
      console.log(`[BarcodeApiService] Fetching barcode ${barcode} from Open Food Facts...`);

      // 1. Try Open Food Facts
      const offUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      const offResponse = await axios.get(offUrl);

      if (offResponse.data && offResponse.data.status === 1) {
        const p = offResponse.data.product;
        console.log(`[BarcodeApiService] Found on OFF: ${p.product_name}`);
        
        return {
          name: p.product_name || 'Unknown External Product',
          brand: p.brands || '',
          category: p.categories?.split(',')[0] || 'Uncategorized',
          image: p.image_url || '',
          barcode: barcode,
          price: 0
        };
      }

      console.log(`[BarcodeApiService] Barcode ${barcode} not found on Open Food Facts.`);
      return null;
    } catch (error: any) {
      console.error('[BarcodeApiService] External API Error:', error.message);
      return null;
    }
  }
}
