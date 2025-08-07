export type User = {
  id: string;
  full_name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  role: "admin" | "dev" | "editor";
};
