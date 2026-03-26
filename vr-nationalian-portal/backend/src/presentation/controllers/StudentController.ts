import { Request, Response } from 'express';
import { StudentUseCase } from '../../application/usecases/StudentUseCase';

export class StudentController {
  constructor(private studentUseCase: StudentUseCase) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password, email, firstName, middleInitial, lastName, sectionId } = req.body;
      const userId = await this.studentUseCase.createStudent({
        username,
        password,
        email,
        firstName,
        middleInitial,
        lastName,
        sectionId
      });
      res.status(201).json({ userId });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getBySection = async (req: Request, res: Response): Promise<void> => {
    try {
      const sectionId = req.params.sectionId; // Changed from parseInt
      const students = await this.studentUseCase.getStudentsBySection(sectionId);
      res.json(students);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id; // Changed from parseInt
      const { username, firstName, middleInitial, lastName, sectionId } = req.body;
      const success = await this.studentUseCase.updateStudent({
        userId,
        username,
        firstName,
        middleInitial,
        lastName,
        sectionId
      });
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id; // Changed from parseInt
      const success = await this.studentUseCase.deleteStudent(userId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const students = await this.studentUseCase.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getByProfessor = async (req: Request, res: Response): Promise<void> => {
    try {
      const professorId = req.params.professorId;
      const students = await this.studentUseCase.getStudentsByProfessor(professorId);
      res.json(students);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getArchived = async (req: Request, res: Response): Promise<void> => {
    try {
      const students = await this.studentUseCase.getArchivedStudents();
      res.json(students);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getArchivedByProfessor = async (req: Request, res: Response): Promise<void> => {
    try {
      const professorId = req.params.professorId;
      const students = await this.studentUseCase.getArchivedStudentsByProfessor(professorId);
      res.json(students);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  archiveUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const success = await this.studentUseCase.archiveUser(userId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  reactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const success = await this.studentUseCase.reactivateUser(userId);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  scheduleArchive = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const { scheduledArchiveDate } = req.body;
      const success = await this.studentUseCase.scheduleArchive(userId, scheduledArchiveDate);
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
