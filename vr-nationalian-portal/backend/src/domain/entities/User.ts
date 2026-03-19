export interface User {
  userId: string; // Changed from number to string (UUID)
  username: string;
  roleId: number;
  roleName: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  sectionId?: string; // Changed from number to string (UUID)
  sectionName?: string;
  sessionToken?: string;
  email?: string;
}

export interface CreateStudentDTO {
  username: string;
  password: string;
  email: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  sectionId: string; // Changed to string (UUID)
}

export interface UpdateStudentDTO {
  userId: string; // Changed to string (UUID)
  username: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  sectionId: string; // Changed to string (UUID)
}

export interface UpdateProfileDTO {
  userId: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
}

export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
