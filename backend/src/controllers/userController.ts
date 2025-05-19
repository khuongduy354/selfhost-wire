import { Request, Response } from "express";

export const getUsers = (req: Request, res: Response) => {
  res.json({ users: [] });
};

export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ id, name: "Example User" });
};

export const createUser = (req: Request, res: Response) => {
  const userData = req.body;
  res.status(201).json({ message: "User created", user: userData });
};
