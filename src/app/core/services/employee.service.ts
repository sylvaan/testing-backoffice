import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly STORAGE_KEY = 'employee_data_v2';
  private readonly AUTH_KEY = 'auth_user';
  private employees: Employee[] = [];

  private readonly firstNames = [
    'Budi', 'Joko', 'Andi', 'Siti', 'Dewi', 'Rudi', 'Ani', 'Eko', 'Rini', 'Agus',
    'Tono', 'Rina', 'Hadi', 'Siska', 'Dedi', 'Lusi', 'Wawan', 'Yanti', 'Hendra', 'Mega',
    'Fahri', 'Aisyah', 'Dimas', 'Putri', 'Rian', 'Indah', 'Bambang', 'Kartika', 'Denny', 'Ratna'
  ];

  private readonly lastNames = [
    'Santoso', 'Prabowo', 'Wijaya', 'Kurniawan', 'Susanto', 'Hidayat', 'Saputra', 'Setiawan', 'Nugroho', 'Wibowo',
    'Siregar', 'Lubis', 'Tarigan', 'Pane', 'Harahap', 'Ginting', 'Sembiring', 'Sinaga', 'Simanjuntak', 'Nasution',
    'Kusuma', 'Gunawan', 'Surya', 'Pratama', 'Utomo', 'Budiman', 'Hardi', 'Raharjo', 'Purnama', 'Dharma'
  ];

  private readonly groups = [
    'IT Development', 'Human Resources', 'Finance & Accounting', 'Marketing', 'Sales',
    'Customer Service', 'Operations', 'Quality Assurance', 'Legal', 'Procurement'
  ];

  constructor() {
    this.initData();
  }

  private initData(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.employees = JSON.parse(stored);
      return;
    }

    const tempEmployees: Employee[] = [];
    const generatedUsernames = new Set<string>();

    for (let i = 1; i <= 100; i++) {
      const fName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const lName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      
      let baseUsername = `${fName.toLowerCase()}.${lName.toLowerCase()}`;
      let username = baseUsername;
      let suffix = 1;
      while (generatedUsernames.has(username)) {
        username = `${baseUsername}.${suffix}`;
        suffix++;
      }
      generatedUsernames.add(username);

      const email = `${username}@company.com`;
      
      const birthYear = 1975 + Math.floor(Math.random() * 27);
      const birthMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
      const birthDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
      const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

      const basicSalary = (45 + Math.floor(Math.random() * 236)) * 100000;
      const status: 'Aktif' | 'Nonaktif' = Math.random() > 0.15 ? 'Aktif' : 'Nonaktif';
      const group = this.groups[(i - 1) % this.groups.length];

      const now = new Date();
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const descDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
      
      const descYear = descDate.getFullYear();
      const descMonth = String(descDate.getMonth() + 1).padStart(2, '0');
      const descDay = String(descDate.getDate()).padStart(2, '0');
      const descHours = String(descDate.getHours()).padStart(2, '0');
      const descMinutes = String(descDate.getMinutes()).padStart(2, '0');
      const description = `${descYear}-${descMonth}-${descDay}T${descHours}:${descMinutes}`;

      tempEmployees.push({
        username,
        firstName: fName,
        lastName: lName,
        email,
        birthDate,
        basicSalary,
        status,
        group,
        description
      });
    }

    this.employees = tempEmployees;
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.employees));
  }

  public getGroups(): string[] {
    return this.groups;
  }

  public getEmployees(): Observable<Employee[]> {
    return of([...this.employees]);
  }

  public getEmployee(username: string): Observable<Employee | undefined> {
    const emp = this.employees.find(e => e.username === username);
    return of(emp ? { ...emp } : undefined);
  }

  public login(username: string, password: string): Observable<boolean> {
    if (username === 'admin' && password === 'admin') {
      const mockUser = { username, role: 'Administrator', loginTime: new Date().toISOString() };
      sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(mockUser));
      return of(true);
    }
    return of(false);
  }

  public logout(): void {
    sessionStorage.removeItem(this.AUTH_KEY);
  }

  public isLoggedIn(): boolean {
    return sessionStorage.getItem(this.AUTH_KEY) !== null;
  }

  public getLoggedInUser(): any {
    const userStr = sessionStorage.getItem(this.AUTH_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
