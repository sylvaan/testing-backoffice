export interface Employee {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  basicSalary: number;
  status: 'Aktif' | 'Nonaktif';
  group: string;
  description: string;
}
