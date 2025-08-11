/**
 * Image Service - Professional Unsplash Integration
 * Zero local storage - all images served from CDN
 */

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

class ImageService {
  
  // Property type to search query mapping
  private readonly propertyQueries = {
    'SINGLE_FAMILY': 'modern house exterior',
    'MULTI_FAMILY': 'apartment building',
    'CONDO': 'luxury condo interior',
    'TOWNHOUSE': 'townhouse residential',
    'COMMERCIAL': 'commercial building office',
    'APARTMENT': 'apartment interior modern',
    'default': 'real estate property'
  };

  // Cache to avoid repeated API calls for same property types
  private cache = new Map<string, UnsplashPhoto[]>();

  /**
   * Get property images by type
   */
  async getPropertyImages(propertyType: string, count: number = 1): Promise<string[]> {
    try {
      const query = this.propertyQueries[propertyType as keyof typeof this.propertyQueries] 
        || this.propertyQueries.default;
      
      const cacheKey = `${query}-${count}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cachedPhotos = this.cache.get(cacheKey)!;
        return cachedPhotos.map(photo => this.optimizeImageUrl(photo.urls.regular));
      }

      // For demo purposes, use curated property images
      const photos = await this.searchPhotos(query, count);
      
      // Cache the results
      this.cache.set(cacheKey, photos);
      
      return photos.map(photo => this.optimizeImageUrl(photo.urls.regular));
    } catch (error) {
      console.error('Error fetching property images:', error);
      return this.getFallbackImages(count);
    }
  }

  /**
   * Get a single property image for a specific property
   */
  async getPropertyImage(propertyId: string, propertyType: string): Promise<string> {
    // Generate consistent image for same property ID
    const images = await this.getPropertyImages(propertyType, 5);
    const index = this.generateConsistentIndex(propertyId, images.length);
    return images[index] || this.getFallbackImage();
  }

  /**
   * Search photos on Unsplash
   */
  private async searchPhotos(query: string, count: number): Promise<UnsplashPhoto[]> {
    // For demo - use curated high-quality real estate photos
    const demoPhotos = this.getCuratedPropertyPhotos(query, count);
    return demoPhotos;
  }

  /**
   * Get curated property photos (demo implementation)
   */
  private getCuratedPropertyPhotos(query: string, count: number): UnsplashPhoto[] {
    const propertyPhotos = {
      'modern house exterior': [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80'
      ],
      'apartment building': [
        'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80',
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80'
      ],
      'luxury condo interior': [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
        'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80',
        'https://images.unsplash.com/photo-1600210492497-48d1e115bc1a?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80'
      ],
      'real estate property': [
        'https://images.unsplash.com/photo-1560448204-61ef4d3fdf05?w=800&q=80',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
      ]
    };

    const urls = propertyPhotos[query as keyof typeof propertyPhotos] || propertyPhotos['real estate property'];
    
    return urls.slice(0, count).map((url, index) => ({
      id: `demo-${query}-${index}`,
      urls: {
        raw: url,
        full: url,
        regular: url,
        small: url.replace('w=800', 'w=400'),
        thumb: url.replace('w=800', 'w=200')
      },
      alt_description: `${query} property`,
      user: {
        name: 'Unsplash Photographer'
      }
    }));
  }

  /**
   * Optimize image URL for performance
   */
  private optimizeImageUrl(url: string): string {
    // Add optimization parameters
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}w=800&q=80&fm=jpg&fit=crop&crop=center`;
    }
    return url;
  }

  /**
   * Generate consistent index for property ID
   */
  private generateConsistentIndex(propertyId: string, arrayLength: number): number {
    let hash = 0;
    for (let i = 0; i < propertyId.length; i++) {
      const char = propertyId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % arrayLength;
  }

  /**
   * Get fallback images when API fails
   */
  private getFallbackImages(count: number): string[] {
    const fallbackUrl = `https://images.unsplash.com/photo-1560448204-61ef4d3fdf05?w=800&q=80&fm=jpg&fit=crop&crop=center`;
    return Array(count).fill(fallbackUrl);
  }

  /**
   * Get single fallback image
   */
  private getFallbackImage(): string {
    return 'https://images.unsplash.com/photo-1560448204-61ef4d3fdf05?w=800&q=80&fm=jpg&fit=crop&crop=center';
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const imageService = new ImageService();
export default imageService;