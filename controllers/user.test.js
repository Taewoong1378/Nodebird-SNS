const { addFollowing } = require('./user');
jest.mock('../models/user');
const User = require('../models/user');

describe('addFollowing', () => {
    const res = {
        status: jest.fn(()=> res),
        send: jest.fn(),
    }
    const req = {
        user: { id: 1 },
        params: { id: 2 },
    };
    const next = jest.fn();
    test('사용자를 찾아 팔로잉을 추가하고 success를 응답해야함', async () => {
        User.findOne.mockReturnValue(Promise.resolve({ 
            id: 1, 
            name: 'taewoong', 
            addFollowings(value){
            return Promise.resolve(true);
        }
    }));
        await addFollowing(req, res, next);
        expect(res.send).toBeCalledWith('success');
    });

    test('사용자를 찾지 못하면 res.status(404).send(no user)를 호출해야함', async () => {
        User.findOne.mockReturnValue(Promise.resolve(null));
        await addFollowing(req, res, next);
        expect(res.status).toBeCalledWith(404);
        expect(res.send).toBeCalledWith('no user');
    });

    test('DB에서 에러가 발생하면 next(error)를 호출함', async () => {
        const error= '사용자 못 찾음';
        User.findOne.mockReturnValue(Promise.reject(error));
        // reject를 통해 catch 호출
        await addFollowing(req, res, next);
        expect(next).toBeCalledWith(error);
    });
});