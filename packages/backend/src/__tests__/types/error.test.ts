import { AppError, ValidationError, NotFoundError, DatabaseError } from '../../types/error';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create AppError with basic properties', () => {
      const error = new AppError(500, 'Test error message');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('should create AppError with optional properties', () => {
      const details = { field: 'test' };
      const error = new AppError(400, 'Test message', 'TEST_CODE', details);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct defaults', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should create ValidationError with details', () => {
      const details = { field: 'email', message: 'Invalid email format' };
      const error = new ValidationError('Invalid input', details);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with correct defaults', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with correct defaults', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.name).toBe('DatabaseError');
    });
  });
}); 
