export interface Professor {
  userId: string; // Changed to string (UUID)
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  email?: string;
  createdAt?: Date;
}

export interface CreateProfessorDTO {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
}

export interface UpdateProfessorDTO {
  userId: string; // Changed to string (UUID)
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
}
