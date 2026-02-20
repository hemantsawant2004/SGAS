export interface CreateGuideProfileDto {
  fullName: string;
  phone: string;
  department:string
  specialization: string;
  bio: string;
}

export interface GuideProfileResponse {
  id: string;
  fullName: string;
  phone: string;
  department:string
  specialization: string;
  bio: string;
  createdAt: string;
}