import type { UserRole } from ".";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    id?: string;
  }
}
