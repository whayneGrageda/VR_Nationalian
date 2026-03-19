import { Request, Response } from 'express';
import { ProfessorUseCase } from '../../application/usecases/ProfessorUseCase';

export class ProfessorController {
  constructor(private professorUseCase: ProfessorUseCase) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password, email, firstName, middleInitial, lastName } = req.body;
      const userId = await this.professorUseCase.createProfessor({
        username,
        password,
        email,
        firstName,
        middleInitial,
        lastName
      });
      res.status(201).json({ userId });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const professors = await this.professorUseCase.getAllProfessors();
      res.json(professors);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id; // Changed from parseInt
      const { username, firstName, middleInitial, lastName } = req.body;
      const success = await this.professorUseCase.updateProfessor({
        userId,
        username,
        firstName,
        middleInitial,
        lastName
      });
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id; // Changed from parseInt
      const success = await this.professorUseCase.deleteProfessor(userId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
