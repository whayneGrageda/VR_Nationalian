import { Request, Response } from 'express';
import { SectionUseCase } from '../../application/usecases/SectionUseCase';

export class SectionController {
  constructor(private sectionUseCase: SectionUseCase) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sectionName, professorId } = req.body;
      const sectionId = await this.sectionUseCase.createSection({ sectionName, professorId });
      res.status(201).json({ sectionId });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getByProfessor = async (req: Request, res: Response): Promise<void> => {
    try {
      const professorId = req.params.professorId; // Changed from parseInt
      const sections = await this.sectionUseCase.getSectionsByProfessor(professorId);
      res.json(sections);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const sectionId = req.params.id; // Changed from parseInt
      const { sectionName, professorId } = req.body;
      const success = await this.sectionUseCase.updateSection({ 
        sectionId, 
        sectionName,
        professorId 
      });
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sectionId = req.params.id; // Changed from parseInt
      const success = await this.sectionUseCase.deleteSection(sectionId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const sections = await this.sectionUseCase.getAllSections();
      res.json(sections);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  deactivate = async (req: Request, res: Response): Promise<void> => {
    try {
      const sectionId = req.params.id;
      const success = await this.sectionUseCase.deactivateSection(sectionId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  activate = async (req: Request, res: Response): Promise<void> => {
    try {
      const sectionId = req.params.id;
      const success = await this.sectionUseCase.activateSection(sectionId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
