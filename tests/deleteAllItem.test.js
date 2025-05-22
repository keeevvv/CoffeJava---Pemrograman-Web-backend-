const { deleteAllItem } = require('../controller/cartController'); 
jest.mock('@prisma/client', () => {
    return {
      PrismaClient: jest.fn().mockImplementation(() => ({
        user: { findFirst: jest.fn() },
        cartItem: { deleteMany: jest.fn() },
      }))
    };
  });
  
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

describe('deleteAllItem', () => {
  let req, res;

  beforeEach(() => {
    req = {
        user: { id: '1', nama: 'Angelica Bashirian' },
        body: { cart_id: 123 }
      };
      

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('Path 1: Delete item', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: '1', nama: 'Angelica Bashirian' });
    prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });

    await deleteAllItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ count: 2 });
  });

  test('Path 2: Throw error youre not signed', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await deleteAllItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Error, You're not signed" });
  });

  test('Path 3: catch unexpected error', async () => {
    prisma.user.findFirst.mockRejectedValue(new Error('DB failed'));

    await deleteAllItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });
});
