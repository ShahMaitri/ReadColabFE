import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = (plainTextPassword: string): Promise<string> => {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
};

export const comparePassword = (
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};
