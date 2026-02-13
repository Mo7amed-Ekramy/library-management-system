import { UserService } from '../services/userService.js';

const userService = new UserService();

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const users = await userService.getAllUsers({ role, search });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const user = await userService.updateUserRole(req.params.id, role);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const clearUserFines = async (req, res, next) => {
  try {
    const user = await userService.clearUserFines(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const payFine = async (req, res, next) => {
  try {
    const result = await userService.payFine(req.user.id, req.body.amount || 0);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
