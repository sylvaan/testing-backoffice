import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent implements OnInit {
  employeeForm!: FormGroup;
  groups: string[] = [];
  submitting = false;
  todayStr = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.groups = this.employeeService.getGroups();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.todayStr = `${yyyy}-${mm}-${dd}`;

    this.initForm();
  }

  private initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      username: ['', [
        Validators.required, 
        Validators.pattern('^[a-z0-9.]+$'),
        Validators.minLength(3),
        Validators.maxLength(30)
      ]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required, this.futureDateValidator]],
      basicSalary: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
      status: ['Aktif', [Validators.required]],
      group: [null, [Validators.required]]
    });

    this.employeeForm.get('firstName')?.valueChanges.subscribe(() => this.suggestUsername());
    this.employeeForm.get('lastName')?.valueChanges.subscribe(() => this.suggestUsername());
  }

  private suggestUsername(): void {
    const fName = (this.employeeForm.get('firstName')?.value || '').trim().toLowerCase();
    const lName = (this.employeeForm.get('lastName')?.value || '').trim().toLowerCase();
    const usernameCtrl = this.employeeForm.get('username');

    if (usernameCtrl && !usernameCtrl.dirty) {
      if (fName && lName) {
        const cleanFName = fName.replace(/[^a-z0-9]/g, '');
        const cleanLName = lName.replace(/[^a-z0-9]/g, '');
        usernameCtrl.setValue(`${cleanFName}.${cleanLName}`);
      } else if (fName) {
        usernameCtrl.setValue(fName.replace(/[^a-z0-9]/g, ''));
      }
    }
  }

  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return { futureDate: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      Object.keys(this.employeeForm.controls).forEach(key => {
        const control = this.employeeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    this.employeeService.getEmployees().subscribe(employees => {
      const nextNum = employees.length > 0 
        ? Math.max(...employees.map(e => {
            const num = parseInt(e.id.replace('EMP-', ''), 10);
            return isNaN(num) ? 0 : num;
          })) + 1
        : 1;
      const nextId = `EMP-${String(nextNum).padStart(3, '0')}`;

      const formVal = this.employeeForm.value;

      const newEmployee: Employee = {
        id: nextId,
        firstName: formVal.firstName.trim(),
        lastName: formVal.lastName.trim(),
        username: formVal.username.trim(),
        email: formVal.email.trim(),
        birthDate: formVal.birthDate,
        basicSalary: Number(formVal.basicSalary),
        status: formVal.status,
        group: formVal.group
      };

      this.employeeService.addEmployee(newEmployee);

      Swal.fire({
        title: 'Berhasil!',
        text: `Pegawai ${newEmployee.firstName} ${newEmployee.lastName} telah ditambahkan dengan ID ${newEmployee.id}.`,
        icon: 'success',
        confirmButtonColor: '#3699ff',
        confirmButtonText: 'Selesai',
        heightAuto: false
      }).then(() => {
        this.router.navigate(['/employees']);
      });

      this.submitting = false;
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}
