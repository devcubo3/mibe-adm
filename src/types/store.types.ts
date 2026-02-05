export interface StoreOwner {
  name: string;
  cpf: string;
  contact: string;
}

export interface Store {
  id: string;
  name: string;
  cnpj: string;
  category: string;
  description: string;
  coverImage: string;
  logo: string;
  rating: number;
  totalReviews: number;
  address: string;
  contact: string;
  email: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cashback: {
    percentage: number;
    description: string;
  };
  rules: {
    expirationDays: number;
    minPurchase: number;
    description: string;
  };
  owner: StoreOwner;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreDTO {
  name: string;
  cnpj: string;
  category: string;
  description: string;
  coverImage: string;
  logo: string;
  address: string;
  contact: string;
  email: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cashback: {
    percentage: number;
    description: string;
  };
  rules: {
    expirationDays: number;
    minPurchase: number;
    description: string;
  };
  owner?: StoreOwner;
  photos?: string[];
}

export interface UpdateStoreDTO extends Partial<Omit<CreateStoreDTO, 'password'>> { }
