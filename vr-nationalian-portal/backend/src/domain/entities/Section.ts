export interface Section {
  sectionId: string; // Changed to string (UUID)
  sectionName: string;
  professorId?: string; // Changed to string (UUID)
  createdAt: Date;
}

export interface CreateSectionDTO {
  sectionName: string;
  professorId?: string; // Made optional
}

export interface UpdateSectionDTO {
  sectionId: string; // Changed to string (UUID)
  sectionName?: string;
  professorId?: string;
}
