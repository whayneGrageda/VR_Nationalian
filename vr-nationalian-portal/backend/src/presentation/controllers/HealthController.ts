import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export class HealthController {
  constructor(private supabase: SupabaseClient) {}

  checkHealth = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    
    try {
      // Check database connection
      const { error: dbError } = await this.supabase
        .from('tblusers')
        .select('user_id')
        .limit(1);

      const dbStatus = !dbError;
      const responseTime = Date.now() - startTime;

      // Get active sessions count (users with session tokens)
      const { count: activeSessions } = await this.supabase
        .from('tblusers')
        .select('user_id', { count: 'exact', head: true })
        .not('session_token', 'is', null);

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          api: {
            status: 'online',
            uptime: process.uptime()
          },
          database: {
            status: dbStatus ? 'online' : 'offline',
            responseTime: `${responseTime}ms`
          },
          vrSessions: {
            status: 'online',
            active: activeSessions || 0
          }
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      });
    }
  };
}
