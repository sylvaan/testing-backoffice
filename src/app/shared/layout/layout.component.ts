import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentUser: any;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.employeeService.getLoggedInUser();
  }

  logout(): void {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Apakah Anda yakin ingin keluar dari sistem?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f64e60',
      cancelButtonColor: '#e4e6ef',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.logout();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Berhasil Keluar!',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });
        this.router.navigate(['/login']);
      }
    });
  }
}
