import { Request, Response } from 'express';
import { sanitizeRequest } from '../../middleware/sanitizer';

describe('sanitizer middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should sanitize XSS in request body', () => {
    mockReq.body = {
      text: '<script>alert("xss")</script>Hello',
    };

    sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.text).toBe(
      '&lt;script&gt;alert("xss")&lt;/script&gt;Hello'
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    mockReq.body = {
      nested: {
        text: '<script>alert("xss")</script>',
      },
    };

    sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.nested.text).toBe(
      '&lt;script&gt;alert("xss")&lt;/script&gt;'
    );
  });
});
