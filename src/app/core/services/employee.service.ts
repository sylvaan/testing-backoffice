import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from '../models/employee.model';
import { MOCK_EMPLOYEES } from '../mocks/employee.mock';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly STORAGE_KEY = 'employee_data_v5';
  private readonly AUTH_KEY = 'auth_user';
  private employees: Employee[] = [];

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
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let healed = false;
          this.employees = parsed.map((emp: any, index: number) => {
            if (!emp.id || emp.id === 'undefined') {
              healed = true;
              return {
                ...emp,
                id: `EMP-${String(index + 1).padStart(3, '0')}`
              };
            }
            return emp;
          });

          if (healed) {
            this.saveToStorage();
          }
          return;
        }
      } catch (e) {
        console.error('Error parsing stored employees, resetting...', e);
      }
    }

    this.employees = JSON.parse(JSON.stringify(MOCK_EMPLOYEES));
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.employees));
  }

  private searchState = {
    searchTerm: '',
    selectedGroup: null as string | null,
    currentPage: 1,
    pageSize: 10
  };

  public getSearchState() {
    return this.searchState;
  }

  public setSearchState(state: any) {
    this.searchState = { ...this.searchState, ...state };
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

  public getEmployeeById(id: string): Observable<Employee | undefined> {
    const emp = this.employees.find(e => e.id === id);
    return of(emp ? { ...emp } : undefined);
  }

  public addEmployee(emp: Employee): void {
    this.employees.push(emp);
    this.saveToStorage();
  }

  public deleteEmployee(id: string): void {
    this.employees = this.employees.filter(e => e.id !== id);
    this.saveToStorage();
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
