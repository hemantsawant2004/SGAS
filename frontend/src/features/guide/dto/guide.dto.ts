export interface CreateGuideProfileDto {
  fullName: string;
  email:string;
  phone: string;
  linkedin:string;
  bio: string;

  departmentName:string;
  qualification:string;
  experience:number;
  expertise:string[];
}

export interface GuideProfileResponse {
  id: number;
  fullName: string;
  username?: string | null;
  email: string;
  phone: string;
  linkedin?: string | null;
  departmentName: string;
  qualification: string;
  experience: number;
  expertise: string[];
  bio: string;
  createdAt: string;
  updatedAt?: string;
}
