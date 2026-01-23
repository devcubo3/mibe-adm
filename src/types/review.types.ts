export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  storeId: string;
  rating: number;
  comment: string;
  storeReply?: string;
  reply?: {
    text: string;
    createdAt: string;
  };
  createdAt: string;
}


export interface CreateReviewDTO {
  storeId: string;
  rating: number;
  comment: string;
}

export interface ReplyReviewDTO {
  text: string;
}
